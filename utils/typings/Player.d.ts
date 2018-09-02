import {Note} from "@utilities";

type _AudioNode = GainNode & {
	stop: () => void;
};

export interface ActiveAudioNotes {
	[key: string]: _AudioNode
}

export interface PlayerInstance {
	play: (midiNumber: string) => _AudioNode;
	schedule: (time: Date | number, notes: Note[]) => any;
}
