import { VISUALIZER_MESSAGES } from "@enums/visualizerMessages";
import { NoteWithEvent, Sampler } from "@utils/typings/Player";
import Tone from "tone";
import { instruments } from "midi-instruments";
import { MIDI, Note, Track } from "midiconvert";
import { EVENT_TYPE } from "@enums/piano";
import { Range } from "@utils/typings/Visualizer";
import { get as getFromIDB, set as setInIDB } from "idb-keyval";
import { CanvasWorkerFallback } from "@controllers/visualizer.controller";
import Recorder from "@utils/Recorder";
import { PIANO_HEIGHT, TRACK_PLAYING_SPEED } from "@config/piano";

function midiJsToJson(data) {
  let begin = data.indexOf("MIDI.Soundfont.");
  if (begin < 0) throw Error("Invalid MIDI.js Soundfont format");
  begin = data.indexOf("=", begin) + 2;
  const end = data.lastIndexOf(",");
  return JSON.parse(data.slice(begin, end) + "}");
}

function getNotesWithNoteEnd(notes: Note[], delay: number = 0) {
  const _notes = [];

  notes.forEach((note, i) => {
    const id = Symbol(note.name);
    const time = note.time + note.duration + delay;
    _notes.push(
      {
        ...note,
        time: note.time + delay,
        event: EVENT_TYPE.NOTE_START,
        id
      },
      {
        ...note,
        time,
        event: EVENT_TYPE.NOTE_STOP,
        id
      }
    );

    if (i === notes.length - 1) {
      _notes.push({
        ...note,
        time,
        event: EVENT_TYPE.PLAYING_COMPLETE,
        id
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
  private canvasWorker: CanvasWorkerFallback;
  private recorder = new Recorder();

  constructor({
    canvasWorker,
    range
  }: {
    canvasWorker: CanvasWorkerFallback;
    range: Range;
  }) {
    this.range = range;
    this.sampler = new Tone.Sampler({});
    this.sampler.connect(Tone.Master);
    this.canvasWorker = canvasWorker;
  }

  private fetchInstrumentFromRemote = async instrument => {
    const url = !process.env.DEV
      ? `https://res.cloudinary.com/dqryno6nz/raw/upload/v1541347481/${instrument}-mp3.js`
      : `https://gleitz.github.io/midi-js-soundfonts/MusyngKite/${instrument}-mp3.js`;
    const response = await fetch(url);
    const data = await response.text();
    const audio = midiJsToJson(data);
    await setInIDB(instrument, audio);
    return audio;
  };

  /**
   * Load a soundFont and add it to Tone sampler.
   * @param instrument
   */
  public loadSoundFont = async (instrument = instruments[0].value) => {
    let audio;
    try {
      audio = await getFromIDB(instrument);
      if (!audio) audio = await this.fetchInstrumentFromRemote(instrument);
    } catch (e) {
      audio = await this.fetchInstrumentFromRemote(instrument);
    }

    const promises = Object.keys(audio).map(
      key => new Promise(resolve => this.sampler.add(key, audio[key], resolve))
    );
    return Promise.all(promises);
  };

  /**
   * Takes a midi number and returns the corresponding note name.
   * @param midi
   */
  private getNoteName = (midi: number) => Tone.Frequency(midi, "midi").toNote();

  /**
   * Plays a single note
   * @param midi
   * @param velocity
   */
  public playNote = (midi: number, velocity = 1) => {
    this.recorder.startNote(midi);

    this.sampler.triggerAttack(this.getNoteName(midi), undefined, velocity);

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
    this.recorder.endNote(midi);

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
    const delay = (window.innerHeight - PIANO_HEIGHT) / TRACK_PLAYING_SPEED;

    const notes = getNotesWithNoteEnd(track.notes, delay);
    Tone.Transport.bpm.value = midi.header.bpm;
    Tone.Transport.duration = track.duration;
    Tone.Transport.seconds = 0;

    let notesPlaying = [];
    this.notesPlayer = new Tone.Part((time: number, note: NoteWithEvent) => {
      if (note.event === EVENT_TYPE.NOTE_START) {
        this.sampler.triggerAttackRelease(
          Tone.Frequency(note.midi, "midi").toNote(),
          note.duration,
          time,
          note.velocity
        );
        notesPlaying.push(note);
        cb(notesPlaying);
      } else if (
        note.event === EVENT_TYPE.NOTE_STOP &&
        notesPlaying.find(_note => _note.id === note.id)
      ) {
        notesPlaying = notesPlaying.filter(_n => _n.id !== note.id);
        cb(notesPlaying);
      } else if (note.event === EVENT_TYPE.PLAYING_COMPLETE) {
        cb(notesPlaying, true);
      }
    }, notes).start();

    Tone.Transport.start();

    const _track: Track = {
      ...track,
      notes: track.notes.map(_note => ({
        ..._note,
        time: _note.time + delay
      })),
      duration: track.duration + delay
    };

    // start playing on the visualizer
    this.canvasWorker.postMessage({
      track: JSON.parse(JSON.stringify(_track)),
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
  public togglePlay = () => {
    if (this.isPlaying) {
      Tone.Transport.pause();
    } else {
      Tone.Transport.start();
    }

    this.isPlaying = !this.isPlaying;

    this.canvasWorker.postMessage({
      message: VISUALIZER_MESSAGES.TOGGLE
    });
  };

  public toggleRecording = () => this.recorder.toggleRecorder();

  public setRange = (range: Range) => {
    this.range = range;
    this.canvasWorker.postMessage({
      message: VISUALIZER_MESSAGES.UPDATE_RANGE,
      range
    });
  };

  public clear = () => {
    if (this.notesPlayer) {
      if (this.notesPlayer._state) {
        this.notesPlayer.dispose();
      }
      this.notesPlayer = null;
    }
    this.isPlaying = false;
    Tone.Transport.stop();
  };
}
