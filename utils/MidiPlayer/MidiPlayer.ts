import Tone from "tone";
import { MidiJSON } from "@utils/midiParser/midiParser";
import LoadInstrumentWorker from "@workers/loadInstrument.worker";
import { promiseWorker } from "@utils/promiseWorker";
import { range as _range } from "lodash";
import { EVENT_TYPE } from "@enums/piano";
import { VISUALIZER_MESSAGES } from "@enums/visualizerMessages";
import { CanvasWorkerFallback } from "@controllers/visualizer.controller";
import {
  getDelay,
  getNotesWithNoteEndEvent,
  getTrackWithDelay,
  NoteWithIdAndEvent
} from "@utils/MidiPlayer/MidiPlayer.utils";
import { Range } from "@utils/typings/Visualizer";
import { getInstrumentIdByValue } from "midi-instruments";

const loadInstrumentWorker = new LoadInstrumentWorker();

interface IScheduleOptions {
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

  private startVisualizer = selectedTrackIndex => {
    const visualizerDelay = getDelay(0);

    const mainTrack = this.midi.tracks[selectedTrackIndex];

    console.log(Date.now());
    this.canvasWorker.postMessage({
      track: mainTrack,
      range: this.range,
      message: VISUALIZER_MESSAGES.PLAY_TRACK
    });
  };

  public scheduleAndPlay = (options: IScheduleOptions, cb: IEventCallback) => {
    const delay = getDelay();

    const {
      selectedTrackIndex = 0,
      playingBeatsIndex = _range(this.midi.beats.length),
      playingTracksIndex = _range(this.midi.tracks.length)
    } = options;

    console.log("a", Date.now());
    this.midi.tracks.forEach((_track, trackIndex) => {
      this.playTrack(trackIndex, playingTracksIndex, cb);
    });

    this.midi.beats.forEach((_beat, beatIndex) => {
      this.playBeat(beatIndex, playingBeatsIndex);
    });
    console.log("b", Date.now());

    Tone.Transport.start(`+${0}`);
    this.startVisualizer(selectedTrackIndex);
  };

  public togglePlay = () => {
    Tone.Transport.toggle();

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
