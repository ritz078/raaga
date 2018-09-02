import WebAudioScheduler from "web-audio-scheduler";
import { Note } from "./typings/Recorder";

export enum EVENT_TYPE {
	NOTE_START = "noteStart",
	NOTE_STOP = "noteStop",
	PLAYING_COMPLETE = "playingComplete"
}

export interface EventArgs extends Note {
	eventType: EVENT_TYPE
}

export default class Clock {
  clock: WebAudioScheduler;

  constructor(ac: AudioContext) {
    this.clock = new WebAudioScheduler({ context: ac });
  }

  callback = e => {
    const t0 = e.playbackTime;
    const t1 = t0 + e.args.duration;
    console.log(t0, t1);
  };

  public clear = () => {};

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
						eventType: EVENT_TYPE.PLAYING_COMPLETE
					});
				}
      });
    });
  };
}
