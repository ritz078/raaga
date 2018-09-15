import {Note} from "midiconvert";
import {EVENT_TYPE} from "@enums/piano";

export interface Sampler {
	connect: (master: any) => void;
	triggerAttack: (note: string) => void;
	triggerRelease: (note: string) => void;
	add: (key: string, buffer: ArrayBuffer) => void;
	context: AudioContext;
	dispose: () => void;
	triggerAttackRelease: (
		note: string,
		duration: number,
		time: number,
		velocity: number
	) => void;
}

export interface NoteWithEvent extends Note {
	event: EVENT_TYPE
}
