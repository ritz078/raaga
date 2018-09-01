export interface Note {
	note: number;
	time: number;
	duration?: number;
}

export class Recorder {
	notes: Note[] = [];
	baseTime = Date.now();

	getPlayingNoteIndex = (midiNumber: number) => {
		return this.notes.findIndex(note => note.note === midiNumber && !note.duration);
	};

	startNote = (note: number) => {
		this.notes.push({
			note,
			time: Date.now() - this.baseTime
		})
	};

	endNote = (midiNumber: number) => {
		const index = this.getPlayingNoteIndex(midiNumber);
		this.notes[index].duration = (Date.now() - this.baseTime) - this.notes[index].time;
	};

	getRecordedNotes = () => {
		return this.notes;
	}
}


