import Tone from "tone";
import LoadInstrumentWorker from "@workers/loadInstrument.worker";
import { promiseWorker } from "@utils/promiseWorker";
import { range as _range } from "lodash";
import { EVENT_TYPE } from "@enums/piano";
import { VISUALIZER_MESSAGES } from "@enums/visualizerMessages";
import { CanvasWorkerFallback } from "@controllers/visualizer.controller";
import {
  getDelay,
  getNotesWithNoteEndEvent,
  NoteWithIdAndEvent
} from "@utils/MidiPlayer/MidiPlayer.utils";
import { Range } from "@utils/typings/Visualizer";
import { getInstrumentIdByValue } from "midi-instruments";
import { MidiJSON } from "@typings/midi";

const loadInstrumentWorker = new LoadInstrumentWorker();

export interface IScheduleOptions {
  selectedTrackIndex: number;
  playingTracksIndex: number[];
  playingBeatsIndex: number[];
}

type IEventCallback = (
  notes: NoteWithIdAndEvent[],
  trackIndex: number,
  isLastEvent?: boolean
) => void;

export class MidiPlayer {
  private midi: MidiJSON;
  private trackSamplers = [];
  private drumSampler;
  private trackPart = [];
  private drumPart = [];
  private range;

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
    midi?: MidiJSON
  ) {
    this.range = range;
    this.canvasWorker = canvasWorker;
    this.midi = midi;
  }

  public setMidi(midi: MidiJSON) {
    this.midi = midi;
  }

  public setRange(range: Range) {
    this.range = range;
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

    const data = await promiseWorker(loadInstrumentWorker, {
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
        key =>
          this.trackSamplers[key] ||
          MidiPlayer.getTrackSampler(data.tracks[key])
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
   * @param trackIndex
   * @param playingTracksIndex
   * @param cb
   */
  private playTrack = (
    trackIndex: number,
    playingTracksIndex: number[],
    cb: IEventCallback
  ) => {
    let notesPlaying = [];
    const track = this.midi.tracks[trackIndex];

    if (playingTracksIndex.includes(trackIndex)) {
      const index = track.instrument.number;

      this.trackSamplers[index].volume.value = track.volume;
      this.trackPart[index] = new Tone.Part(
        (time, note: NoteWithIdAndEvent) => {
          if (note.event === EVENT_TYPE.NOTE_START) {
            this.trackSamplers[index].triggerAttackRelease(
              note.name,
              note.duration,
              time
            );

            notesPlaying.push(note);
            cb(notesPlaying, trackIndex);
          } else if (
            note.event === EVENT_TYPE.NOTE_STOP &&
            notesPlaying.find(_note => _note.id === note.id)
          ) {
            notesPlaying = notesPlaying.filter(_n => _n.id !== note.id);
            cb(notesPlaying, trackIndex);
          } else if (note.event === EVENT_TYPE.PLAYING_COMPLETE) {
            cb(notesPlaying, trackIndex, true);
          }
        },
        getNotesWithNoteEndEvent(track.notes)
      ).start();
    }
  };

  /**
   * Play a single beat from a MIDI
   * @param beatIndex
   * @param playingBeatsIndex
   */
  private playBeat = (beatIndex: number, playingBeatsIndex: number[]) => {
    const beat = this.midi.beats[beatIndex];
    if (playingBeatsIndex.includes(beatIndex)) {
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
    }
  };

  /**
   * Starts the visualizer with the main selected track.
   * @param selectedTrackIndex
   */
  private startVisualizer = selectedTrackIndex => {
    const mainTrack = this.midi.tracks[selectedTrackIndex];

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
    const {
      selectedTrackIndex = 0,
      playingBeatsIndex = _range(this.midi.beats.length),
      playingTracksIndex = _range(this.midi.tracks.length)
    } = options;

    this.midi.tracks.forEach((_track, trackIndex) => {
      this.playTrack(trackIndex, playingTracksIndex, cb);
    });

    this.midi.beats.forEach((_beat, beatIndex) => {
      this.playBeat(beatIndex, playingBeatsIndex);
    });

    Tone.Transport.start(`+${getDelay()}`);
    this.startVisualizer(selectedTrackIndex);
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

  /**
   * Cleans everything.
   * 1. disposes all Notes trigger events scheduled in Tone.Transport
   * 2. Clears the visualizer canvas.
   *
   * This needs to be called every time we want to reset everything.
   */
  public clear = () => {
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

    this.canvasWorker.postMessage({
      type: VISUALIZER_MESSAGES.STOP_TRACK
    });
  };
}
