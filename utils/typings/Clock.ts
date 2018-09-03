import {Note} from "./Recorder";

export enum EVENT_TYPE {
	NOTE_START = "noteStart",
	NOTE_STOP = "noteStop",
	PLAYING_COMPLETE = "playingComplete"
}

export interface EventArgs extends Note {
	eventType: EVENT_TYPE
}

export interface ClockInterface {
	insert: (time: number, cb: (e: {args: EventArgs}) => void, args: EventArgs) => void;
	start: (cb: () => void) => void;
}
