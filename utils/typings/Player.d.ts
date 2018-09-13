import {Note} from "@utilities";

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
