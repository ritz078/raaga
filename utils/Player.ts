import {
  VISUALIZER_MESSAGES,
  VISUALIZER_MODE
} from "@enums/visualizerMessages";
import {
  NoteWithEvent,
  Sampler,
  CanvasWorkerInterface
} from "@utils/typings/Player";
import Tone from "tone";
import { instruments } from "midi-instruments";
import { MIDI, Note, Track } from "midiconvert";
import { EVENT_TYPE } from "@enums/piano";
import { Range } from "@utils/typings/Visualizer";
import { get, set } from "idb-keyval";

function midiJsToJson(data) {
  let begin = data.indexOf("MIDI.Soundfont.");
  if (begin < 0) throw Error("Invalid MIDI.js Soundfont format");
  begin = data.indexOf("=", begin) + 2;
  const end = data.lastIndexOf(",");
  return JSON.parse(data.slice(begin, end) + "}");
}

function getNotesWithNoteEnd(notes: Note[]) {
  const _notes = [];

  notes.forEach((note, i) => {
    _notes.push(
      {
        ...note,
        event: EVENT_TYPE.NOTE_START
      },
      {
        ...note,
        time: note.time + note.duration,
        event: EVENT_TYPE.NOTE_STOP
      }
    );

    if (i === notes.length - 1) {
      _notes.push({
        ...note,
        time: note.time + note.duration,
        event: EVENT_TYPE.PLAYING_COMPLETE
      });
    }
  });

  return _notes;
}

export class Player {
  private range: Range;
  private sampler: Sampler;
  public isPlaying = false;
  private notesPlayer: any;
  private canvasWorker: CanvasWorkerInterface;

  constructor({
    canvasWorker,
    range
  }: {
    canvasWorker: CanvasWorkerInterface;
    range: Range;
  }) {
    this.range = range;
    this.sampler = new Tone.Sampler({});
    this.sampler.connect(Tone.Master);
    this.canvasWorker = canvasWorker;
  }

  /**
   * Load a soundFont and add it to Tone sampler.
   * @param instrument
   */
  public loadSoundFont = async (instrument = instruments[0].value) => {
    let audio;
    try {
      audio = await get(instrument);
    } catch (e) {
      const url = `https://gleitz.github.io/midi-js-soundfonts/MusyngKite/${instrument}-ogg.js`;
      const response = await fetch(url);
      const data = await response.text();
      audio = midiJsToJson(data);
      await set(instrument, audio);
    }
    Object.keys(audio).forEach(key => this.sampler.add(key, audio[key]));
  };

  /**
   * Takes a midi number and returns the corresponding note name.
   * @param midi
   */
  private getNoteName = (midi: number) => Tone.Frequency(midi, "midi").toNote();

  /**
   * Plays a single note
   * @param midi
   */
  public playNote = (midi: number) => {
    this.sampler.triggerAttack(this.getNoteName(midi));

    this.canvasWorker.postMessage({
      message: VISUALIZER_MESSAGES.PLAY_NOTE,
      midi
    });
  };

  /**
   * Stops a note that's already playing.
   * @param midi
   */
  public stopNote = (midi: number) => {
    this.sampler.triggerRelease(this.getNoteName(midi));

    this.canvasWorker.postMessage({
      message: VISUALIZER_MESSAGES.STOP_NOTE,
      midi
    });
  };

  /**
   * Play a track in read mode
   * @param midi
   * @param track
   * @param cb
   */
  public playTrack = (midi: MIDI, track: Track, cb) => {
    const notes = getNotesWithNoteEnd(track.notes);
    Tone.Transport.bpm.value = midi.header.bpm;
    Tone.Transport.duration = track.duration;
    Tone.Transport.seconds = 0;

    this.notesPlayer = new Tone.Part((time: number, note: NoteWithEvent) => {
      if (note.event === EVENT_TYPE.NOTE_START) {
        this.sampler.triggerAttackRelease(
          Tone.Frequency(note.midi, "midi").toNote(),
          note.duration,
          time,
          note.velocity
        );
      }

      // callback for all events
      cb(note);
    }, notes).start();

    Tone.Transport.start();

    // start playing on the visualizer
    this.canvasWorker.postMessage({
      track,
      range: this.range,
      message: VISUALIZER_MESSAGES.PLAY_TRACK
    });

    this.isPlaying = true;
  };

  /**
   * Stops the track.
   */
  public stopTrack = () => {
    Tone.Transport.stop();

    this.notesPlayer && this.notesPlayer.dispose();

    this.canvasWorker.postMessage({
      message: VISUALIZER_MESSAGES.STOP_TRACK
    });

    this.isPlaying = false;
  };

  /**
   * Toggle play/pause of track. Only works in read mode.
   * Is no-op in write mode.
   */
  public toggle = () => {
    if (this.isPlaying) {
      Tone.Transport.pause();
      this.isPlaying = false;
    } else {
      Tone.Transport.start();
      this.isPlaying = true;
    }

    this.canvasWorker.postMessage({
      message: VISUALIZER_MESSAGES.TOGGLE
    });
  };

  public setMode = (mode: VISUALIZER_MODE) => {
    this.canvasWorker.postMessage({
      message: VISUALIZER_MESSAGES.SET_MODE,
      mode
    });
  };

  public setRange = (range: Range) => {
    this.range = range;
    this.canvasWorker.postMessage({
      message: VISUALIZER_MESSAGES.UPDATE_RANGE,
      range
    });
  };

  public clear = () => {
    this.isPlaying = false;
  };
}
