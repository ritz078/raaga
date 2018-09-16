import Tone from "tone";
import load from "audio-loader";
import { create, MIDI, Note } from "midiconvert";
import { NoteWithEvent, Sampler } from "./typings/Player";
import { EVENT_TYPE } from "@enums/piano";

function nameToUrl(name, format: "mp3" | "ogg" = "mp3"): string {
  return `https://gleitz.github.io/midi-js-soundfonts/MusyngKite/${name}-${format}.js`;
}

export class Player {
  sampler: Sampler;
  private _midi: MIDI;
  private _activeNotes: Map<number, number>;
  private _track: any;
  private _recordingStartTime: number = null;
  private _notesPlayer: any;

  constructor() {
    this.sampler = new Tone.Sampler({});
    this.sampler.connect(Tone.Master);
    this._activeNotes = new Map();
  }

  private getRelativeTime = () => Date.now() / 1000 - this._recordingStartTime;

  public startRecording = () => {
    this._midi = create();
    // @ts-ignore
    this._track = this._midi.track().patch(32);
    this._recordingStartTime = Date.now() / 1000;
  };

  public stopRecording = () => {
    this._recordingStartTime = null;
    this._activeNotes.clear();
  };

  static getNotesWithStopCallback = (notes: Note[]): NoteWithEvent[] => {
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
  };

  public playMidi = (track, midi, cb) => {
    const notes = Player.getNotesWithStopCallback(track.notes);
    Tone.Transport.bpm.value = midi.header.bpm;

    this._notesPlayer = new Tone.Part((time: number, note: NoteWithEvent) => {
      if (note.event === EVENT_TYPE.NOTE_START) {
        this.sampler.triggerAttackRelease(
          Tone.Frequency(note.midi, "midi").toNote(),
          note.duration,
          time,
          note.velocity
        );
      }

      cb(note);
    }, notes).start();

    Tone.Transport.start();
  };

  public playRecording = cb => {
    this.playMidi(0, this._midi, cb);
  };

  public loadSound = async (instrument = "accordion") => {
    let buffers;
    if (instrument === "accordion") {
      // @ts-ignore
      buffers = await import("./soundfont-mp3.json");
      delete buffers.__webpackChunkName;
    } else {
      buffers = await load(nameToUrl(instrument));
    }
    Object.keys(buffers).forEach(key => this.sampler.add(key, buffers[key]));
  };

  public startNote = (midiNumber: number) => {
    if (this._recordingStartTime) {
      this._activeNotes.set(midiNumber, this.getRelativeTime());
    }

    this.sampler.triggerAttack(Tone.Frequency(midiNumber, "midi").toNote());
  };

  public stopNote = (midiNumber: number) => {
    if (this._recordingStartTime) {
      this._track.note(
        midiNumber,
        this._activeNotes.get(midiNumber),
        Date.now() / 1000 -
          this._activeNotes.get(midiNumber) -
          this._recordingStartTime
      );
    }

    this.sampler.triggerRelease(Tone.Frequency(midiNumber, "midi").toNote());
  };

  public reset = () => {
    // TODO: fix this
    this._notesPlayer && this._notesPlayer.dispose();
    this._activeNotes.clear();
    this._recordingStartTime = null;
  };
}
