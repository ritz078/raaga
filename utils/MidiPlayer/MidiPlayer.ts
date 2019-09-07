import Tone from "tone";
import LoadInstrumentWorker from "@workers/loadInstrument.worker";
import { promisifyWorker } from "@utils/promisifyWorker";
import { EVENT_TYPE } from "@enums/piano";
import {
  VISUALIZER_MESSAGES,
  VISUALIZER_MODE
} from "@enums/visualizerMessages";
import { CanvasWorkerFallback } from "@controllers/visualizer.controller";
import {
  getDelay,
  getNotesWithNoteEndEvent,
  NoteWithIdAndEvent
} from "@utils/MidiPlayer/MidiPlayer.utils";
import { Range } from "@utils/typings/Visualizer";
import { getInstrumentIdByValue } from "midi-instruments";
import { IMidiJSON } from "@typings/midi";
import { DEFAULT_FIRST_KEY, DEFAULT_LAST_KEY } from "@config/piano";
import { MidiSettings } from "@components/TrackList";

const loadInstrumentWorker = new LoadInstrumentWorker();

const defaultRange = {
  first: DEFAULT_FIRST_KEY,
  last: DEFAULT_LAST_KEY
};

export type IScheduleOptions = MidiSettings;

type IEventCallback = (
  notes: NoteWithIdAndEvent[],
  trackIndex: number,
  isLastEvent?: boolean
) => void;

export interface Sampler {
  connect: (master: any) => void;
  triggerAttack: (note: string, time?: number, velocity?: number) => void;
  triggerRelease: (note: string) => void;
  add: (key: string, buffer: ArrayBuffer, cb: () => void) => void;
  context: AudioContext;
  dispose: () => void;
  triggerAttackRelease: (
    note: string,
    duration: number,
    time: number,
    velocity?: number
  ) => void;
  volume: {
    value: number;
  };
  _volume: {
    mute: boolean;
  };
}

export class MidiPlayer {
  private midi: IMidiJSON;
  private trackSamplers: Sampler[] = [];
  private drumSampler: Sampler;
  private trackPart = [];
  private drumPart = [];
  private range;
  private mainTrackIndex = 0;

  static getTrackSampler = audio => {
    return new Promise(resolve => {
      const sampler = new Tone.Sampler(audio, () => {
        sampler.connect(Tone.Master);
        resolve(sampler);
      });
    });
  };

  /**
   * Takes a midi number and returns the corresponding note name.
   * @param midi
   */
  static getNoteName = (midi: number) => Tone.Frequency(midi, "midi").toNote();

  private canvasWorker: CanvasWorkerFallback;

  constructor(
    canvasWorker: CanvasWorkerFallback,
    range: Range,
    midi?: IMidiJSON
  ) {
    this.range = range;
    this.canvasWorker = canvasWorker;
    this.midi = midi;
  }

  public setMidi(midi: IMidiJSON) {
    this.midi = midi;
  }

  public setRange(range: Range) {
    this.range = range;
    this.canvasWorker.postMessage({
      message: VISUALIZER_MESSAGES.UPDATE_RANGE,
      range
    });
  }

  /**
   * Loads the instruments and populates the ToneJS samplers
   * with the received data.
   * @param options
   */
  public loadInstruments = async (options?: {
    instrumentIds?: string[];
    drums?: boolean;
  }) => {
    const { instrumentIds, drums } = {
      instrumentIds:
        (options && options.instrumentIds) ||
        this.midi.tracks
          .map(track => track.instrument && track.instrument.number)
          .filter(Boolean),
      drums: options ? options.drums : this.midi.beats && this.midi.beats.length
    };

    const data = await promisifyWorker(loadInstrumentWorker, {
      instrumentIds,
      drums
    });

    if (data.drums && !this.drumSampler) {
      this.drumSampler = await new Promise(resolve => {
        const sampler = new Tone.Sampler(data.drums, () => {
          sampler.connect(Tone.Master);
          resolve(sampler);
        });
      });
    }

    const trackInstrumentIds = Object.keys(data.tracks);
    const samplers = await Promise.all(
      trackInstrumentIds.map(
        instrumentId =>
          this.trackSamplers[instrumentId] ||
          MidiPlayer.getTrackSampler(data.tracks[instrumentId])
      )
    );

    samplers.forEach((sampler, i) => {
      const instrumentId = trackInstrumentIds[i];

      this.trackSamplers[instrumentId] = sampler;
    });
  };

  public playNote = (midi: number, instrument, velocity = 1) => {
    const instrumentId = getInstrumentIdByValue(instrument);
    this.trackSamplers[instrumentId].triggerAttack(
      MidiPlayer.getNoteName(midi),
      undefined,
      velocity
    );

    this.canvasWorker.postMessage({
      message: VISUALIZER_MESSAGES.PLAY_NOTE,
      midi
    });
  };

  /**
   * Stop playing a note and trigger the end of that note on Visualizer
   * @param midi
   * @param instrument
   */
  public stopNote = (midi: number, instrument) => {
    const instrumentId = getInstrumentIdByValue(instrument);
    this.trackSamplers[instrumentId].triggerRelease(
      MidiPlayer.getNoteName(midi)
    );

    this.canvasWorker.postMessage({
      message: VISUALIZER_MESSAGES.STOP_NOTE,
      midi
    });
  };

  /**
   * Play a single track of a MIDI.
   * @param currentTrackIndex
   * @param cb
   */
  private playTrack = (currentTrackIndex: number, cb: IEventCallback) => {
    let notesPlaying = [];
    const track = this.midi.tracks[currentTrackIndex];

    const instrumentNumber = track.instrument.number;

    const sampler = this.trackSamplers[instrumentNumber];
    // make sure that the instrument is not muted.
    sampler._volume.mute = false;

    // set the volume to the tracks volume.
    sampler.volume.value = track.volume;

    this.trackPart[instrumentNumber] = new Tone.Part(
      (time, note: NoteWithIdAndEvent) => {
        if (note.event === EVENT_TYPE.NOTE_START) {
          sampler.triggerAttackRelease(note.name, note.duration, time);

          notesPlaying.push(note);
          cb(notesPlaying, currentTrackIndex);
        } else if (
          note.event === EVENT_TYPE.NOTE_STOP &&
          notesPlaying.find(_note => _note.id === note.id)
        ) {
          notesPlaying = notesPlaying.filter(_n => _n.id !== note.id);
          cb(notesPlaying, currentTrackIndex);
        } else if (note.event === EVENT_TYPE.PLAYING_COMPLETE) {
          cb(notesPlaying, currentTrackIndex, true);
        }
      },
      getNotesWithNoteEndEvent(track.notes)
    ).start();
  };

  /**
   * Play a single beat from a MIDI
   * @param currentBeatIndex
   */
  private playBeat = (currentBeatIndex: number) => {
    const beat = this.midi.beats[currentBeatIndex];
    const beatInstrumentNumber = beat.instrument.number;
    this.drumPart[beatInstrumentNumber] = new Tone.Part(
      time => {
        this.drumSampler.triggerAttack(
          Tone.Frequency(beatInstrumentNumber, "midi").toNote(),
          time
        );
      },
      beat.notes.map(_beat => ({
        ..._beat,
        note: Tone.Frequency(beatInstrumentNumber, "midi").toNote()
      }))
    ).start();
  };

  /**
   * Starts the visualizer with the main selected track.
   */
  private startVisualizer = () => {
    const mainTrack = this.midi.tracks[this.mainTrackIndex];

    this.canvasWorker.postMessage({
      track: mainTrack,
      range: this.range,
      message: VISUALIZER_MESSAGES.PLAY_TRACK,
      delay: getDelay()
    });
  };

  /**
   * Schedules all the track events and beat events. Also starts the visualizer
   * with the data of the main selected track.
   * @param options
   * @param cb
   */
  public scheduleAndPlay = (options: IScheduleOptions, cb: IEventCallback) => {
    const { selectedTrackIndex = 0, playBeats, playBackgroundTracks } = options;
    this.mainTrackIndex = selectedTrackIndex;

    this.midi.tracks.forEach((_track, currentTrackIndex) => {
      if (playBackgroundTracks || selectedTrackIndex === currentTrackIndex) {
        this.playTrack(currentTrackIndex, cb);
      }
    });

    this.midi.beats.forEach((_beat, currentBeatIndex) =>
      this.playBeat(currentBeatIndex)
    );

    if (!playBeats && this.drumSampler) {
      this.drumSampler._volume.mute = true;
    }

    Tone.Transport.start(`+${getDelay()}`);
    this.startVisualizer();
  };

  public togglePlay = () => {
    if (Tone.Transport.state === "started") {
      Tone.Transport.pause();
    } else {
      Tone.Transport.start();
    }

    this.canvasWorker.postMessage({
      message: VISUALIZER_MESSAGES.TOGGLE
    });
  };

  public toggleBeatsVolume = () => {
    if (!this.drumSampler) return;
    this.drumSampler._volume.mute = !this.drumSampler._volume.mute;
  };

  public toggleTracksVolume = () => {
    this.midi.tracks.forEach((track, i) => {
      const instrumentIndex = track.instrument.number;
      if (i !== this.mainTrackIndex) {
        this.trackSamplers[instrumentIndex]._volume.mute = !this.trackSamplers[
          instrumentIndex
        ]._volume.mute;
      }
    });
  };

  /**
   * Cleans everything.
   * 1. disposes all Notes trigger events scheduled in Tone.Transport
   * 2. Clears the visualizer canvas.
   *
   * This needs to be called every time we want to reset everything.
   */
  public clear = () => {
    this.canvasWorker.postMessage({
      type: VISUALIZER_MESSAGES.STOP_TRACK
    });
    Tone.Transport.stop();

    [...this.trackPart, ...this.drumPart].forEach(trackPart => {
      if (!trackPart) return;
      trackPart.stop();
      if (trackPart._state) {
        trackPart.dispose();
      }
    });

    this.trackPart = [];
    this.drumPart = [];
    this.setRange(defaultRange);

    this.setSpeed(1);
  };

  public setSpeed = (speed: number) => {
    Tone.Transport.bpm.value = speed * 120;

    this.canvasWorker.postMessage({
      message: VISUALIZER_MESSAGES.SET_SPEED,
      speed
    });
  };

  public setMode = (mode: VISUALIZER_MODE) => {
    this.canvasWorker.postMessage({
      message: VISUALIZER_MESSAGES.SET_MODE,
      mode
    });
  };
}
