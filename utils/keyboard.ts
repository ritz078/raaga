import {Note} from "midiconvert";

export function getMidiRange(notes: Note[]) {
	const midis = notes.map(note => note.midi);
	return [Math.min(...midis), Math.max(...midis)]
}

export function isWithinRange(toCheck: number[], range: number[]) {
	return range[0] <= toCheck[0] && range[1] >= toCheck[1]
}
