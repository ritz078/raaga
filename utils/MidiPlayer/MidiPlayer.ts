import Tone from "tone";
import LoadInstrumentWorker from "@workers/loadInstrument.worker";
import { EVENT_TYPE } from "@enums/piano";
import {
  VISUALIZER_MESSAGES,
  VISUALIZER_MODE
} from "@enums/visualizerMessages";
import {
  getDelay,
  getNotesWithNoteEndEvent,
  NoteWithIdAndEvent
} from "@utils/MidiPlayer/MidiPlayer.utils";
import { Range } from "@utils/typings/Visualizer";
import { getInstrumentIdByValue } from "midi-instruments";
import { MidiSettings } from "@components/TrackList";
import { OFFSCREEN_2D_CANVAS_SUPPORT } from "@enums/offscreen2dCanvasSupport";
import { promisifyWorker } from "@utils/promisifyWorker";
import { Midi } from "@utils/Midi/Midi";

const loadInstrumentWorker = promisifyWorker(new LoadInstrumentWorker());

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
  private midi: Midi;
  private trackSamplers: Sampler[] = [];
  private drumSampler: Sampler;
  private trackPart = [];
  private drumPart = [];
  private range;
  private mainTrackIndex = 0;
  private is2dOffscreenCanvasSupported =
    OFFSCREEN_2D_CANVAS_SUPPORT.DETERMINING;

  static getTrackSampler = audio =>
    new Promise(resolve => {
      const sampler = new Tone.Sampler(audio, () => {
        sampler.connect(Tone.Master);
        resolve(sampler);
      });
    });

  /**
   * Takes a midi number and returns the corresponding note name.
   * @param midi
   */
  static getNoteName = (midi: number) => Tone.Frequency(midi, "midi").toNote();

  private canvasProxy: any;

  constructor(range: Range, midi?: Midi) {
    this.range = range;
    this.midi = midi;
  }

  public setCanvasProxy = (canvasProxy: any) => {
    this.canvasProxy = canvasProxy;
  };

  public setMidi(midi: Midi) {
    this.midi = midi;
  }

  public setRange(range: Range) {
    this.range = range;
    this.canvasProxy({
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
        options?.instrumentIds ||
        this.midi.tracks
          .map(track => track.instrument && track.instrument.number)
          .filter(Boolean),
      drums: options ? options.drums : this.midi.beats && this.midi.beats.length
    };

    const data: any = await loadInstrumentWorker({instrumentIds, drums});

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

  public playNote = async (midi: number, instrument, velocity = 1) => {
    const instrumentId = getInstrumentIdByValue(instrument);
    this.trackSamplers[instrumentId].triggerAttack(
      MidiPlayer.getNoteName(midi),
      undefined,
      velocity
    );

    await this.canvasProxy({
      message: VISUALIZER_MESSAGES.PLAY_NOTE,
      midi
    });
  };

  /**
   * Stop playing a note and trigger the end of that note on Visualizer
   * @param midi
   * @param instrument
   */
  public stopNote = async (midi: number, instrument) => {
    const instrumentId = getInstrumentIdByValue(instrument);
    this.trackSamplers[instrumentId].triggerRelease(
      MidiPlayer.getNoteName(midi)
    );

    await this.canvasProxy({
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

    this.trackPart[instrumentNumber] = new Tone.Part(
      (time, note: NoteWithIdAndEvent) => {
        if (note.event === EVENT_TYPE.NOTE_START) {
          const duration = note.endTime - note.startTime;
          sampler.triggerAttackRelease(
            Tone.Frequency(note.pitch, "midi").toNote(),
            duration,
            time
          );

          notesPlaying.push(note);
          cb(notesPlaying, currentTrackIndex);

          Tone.Draw.schedule(() => {
            this.midi.redrawStaff(note)
          }, time)
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
   * @param _ beat IBeat
   * @param currentBeatIndex
   */
  private playBeat = (_, currentBeatIndex: number) => {
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
        time: _beat.startTime
      }))
    ).start();
  };

  /**
   * Starts the visualizer with the main selected track.
   */
  private startVisualizer = async () => {
    const mainTrack = this.midi.tracks[this.mainTrackIndex];
    await this.canvasProxy({
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
  public scheduleAndPlay = async (
    options: IScheduleOptions,
    cb: IEventCallback
  ) => {
    const { selectedTrackIndex = 0, playBeats, playBackgroundTracks } = options;
    this.mainTrackIndex = selectedTrackIndex;

    this.midi.tracks.forEach((_track, currentTrackIndex) => {
      if (playBackgroundTracks || selectedTrackIndex === currentTrackIndex) {
        this.playTrack(currentTrackIndex, cb);
      }
    });

    this.midi.beats.forEach(this.playBeat);

    if (!playBeats && this.drumSampler) {
      this.drumSampler._volume.mute = true;
    }

    Tone.Transport.start(`+${getDelay()}`);

    if (this.is2dOffscreenCanvasSupported) {
      await this.startVisualizer();
    }
  };

  public togglePlay = async () => {
    if (Tone.Transport.state === "started") {
      Tone.Transport.pause();
    } else {
      Tone.Transport.start();
    }

    this.canvasProxy({
      message: VISUALIZER_MESSAGES.TOGGLE
    });
  };

  public toggleBeatsVolume = () => {
    if (!this.drumSampler) return;
    this.drumSampler._volume.mute = !this.drumSampler._volume.mute;
  };

  public toggleTracksVolume = () => {
    const { tracks } = this.midi;

    const mainTrackInstrumentIndex =
      tracks[this.mainTrackIndex]?.instrument.number;
    tracks.forEach((track, i) => {
      const instrumentIndex = track.instrument.number;
      if (
        i !== this.mainTrackIndex &&
        instrumentIndex !== mainTrackInstrumentIndex
      ) {
        // TODO: Don't mute a sampler. Mute a track. In case of multiple tracks this causes issue.
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
  public clear = async () => {
    await this.canvasProxy({
      message: VISUALIZER_MESSAGES.STOP_TRACK
    });

    [...this.trackPart, ...this.drumPart].filter(Boolean).forEach(part => {
      part.dispose();
    });

    Tone.Transport.stop();
    Tone.Transport.cancel();

    this.trackPart = [];
    this.drumPart = [];

    this.setSpeed(1);
  };

  public setSpeed = async (speed: number) => {
    Tone.Transport.bpm.value = speed * 120;

    await this.canvasProxy({
      message: VISUALIZER_MESSAGES.SET_SPEED,
      speed
    });
  };

  public setMode = async (mode: VISUALIZER_MODE) => {
    await this.canvasProxy({
      message: VISUALIZER_MESSAGES.SET_MODE,
      mode
    });
  };

  public set2dOffscreenCanvasSupport = (
    support: OFFSCREEN_2D_CANVAS_SUPPORT
  ) => {
    this.is2dOffscreenCanvasSupported = support;
  };
}
