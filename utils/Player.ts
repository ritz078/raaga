import Tone from "tone";
import load from "audio-loader";
import { create, MIDI } from "midiconvert";
import { Clock } from "@utils";
import { Sampler } from "./typings/Player";

function nameToUrl(name, format: "mp3" | "ogg" = "mp3"): string {
  return `https://gleitz.github.io/midi-js-soundfonts/MusyngKite/${name}-${format}.js`;
}

export class Player {
  sampler: Sampler;
  private _clock: Clock;
  private _midi: MIDI;
  private _activeNotes: Map<number, number>;
  private _track: any;
  private _recordingStartTime: number = null;
  private _notesPlayer: any;

  constructor() {
    this.sampler = new Tone.Sampler({});
    this.sampler.connect(Tone.Master);
    this._activeNotes = new Map();
    this._clock = new Clock(this.sampler.context);
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

  public playMidi = (trackIndex, midi, cb, progress) => {
  	console.log(progress);
    Tone.Transport.bpm.value = midi.header.bpm;

    this._clock.setCallbacks(midi.tracks[trackIndex].notes, cb);

    this._notesPlayer = new Tone.Part((time, note) => {
    	// setup callback here
      this.sampler.triggerAttackRelease(
        Tone.Frequency(note.midi, "midi").toNote(),
        note.duration,
        time,
        note.velocity
      );
    }, midi.tracks[trackIndex].notes).start();

    Tone.Transport.start();
	};

  public playRecording = (cb, progress) => {
    this.playMidi(0, this._midi, cb, progress);
  };

  public loadSound = async (instrument = "accordion") => {
    const buffers = await load(nameToUrl(instrument));
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
    this._notesPlayer && this._notesPlayer.dispose();
    this._clock.dispose();
    this._activeNotes.clear();
    this._recordingStartTime = null;
  };
}
