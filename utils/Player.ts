import { VISUALIZER_MESSAGES } from "@enums/visualizerMessages";
import { NoteWithEvent, Sampler } from "@utils/typings/Player";
import Tone from "tone";
import { EVENT_TYPE } from "@enums/piano";
import { Range } from "@utils/typings/Visualizer";
import { CanvasWorkerFallback } from "@controllers/visualizer.controller";
import Recorder from "@utils/Recorder";
import { PIANO_HEIGHT, TRACK_PLAYING_SPEED } from "@config/piano";
import { Midi, Note, Track } from "@typings/midi";

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

  /**
   * Play a track in read mode
   * @param midi
   * @param track
   * @param cb
   */
  public playTrack = (midi: Midi, track: Track, cb) => {
    const delay = (window.innerHeight - PIANO_HEIGHT) / TRACK_PLAYING_SPEED;

    const notes = getNotesWithNoteEnd(track.notes, delay);
    Tone.Transport.bpm.value = midi.header.tempos[0].bpm;
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
        duration: _note.duration,
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
