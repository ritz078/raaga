import WebAudioScheduler from "web-audio-scheduler";
import { ClockInterface, EVENT_TYPE } from "./typings/Clock";
import {Note} from "midiconvert";

export class Clock {
  clock: ClockInterface;
  _context: AudioContext;

  constructor(ac: AudioContext) {
  	this._context = ac;
    this.clock = new WebAudioScheduler({ context: ac });
  }

  public setCallbacks = (notes: Note[], cb) => {
  	const currentTime = this._context.currentTime;
    this.clock.start(() => {
      notes.forEach((note, i) => {
        this.clock.insert(currentTime + note.time, cb, {
          ...note,
          eventType: EVENT_TYPE.NOTE_START
        });
        this.clock.insert(currentTime + note.time + note.duration, cb, {
          ...note,
          eventType: EVENT_TYPE.NOTE_STOP
        });

        if (i === notes.length - 1) {
          this.clock.insert(currentTime + note.time + note.duration, cb, {
            ...note,
            eventType: EVENT_TYPE.PLAYING_COMPLETE
          });
        }
      });
    });
  };
}
