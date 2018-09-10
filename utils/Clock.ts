import WebAudioScheduler from "web-audio-scheduler";
import { Note } from "./typings/Recorder";
import { ClockInterface, EVENT_TYPE } from "./typings/Clock";

export class Clock {
  clock: ClockInterface;

  constructor(ac: AudioContext) {
    this.clock = new WebAudioScheduler({ context: ac });
  }

  public setCallbacks = (notes: Note[], currentTime, cb) => {
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
