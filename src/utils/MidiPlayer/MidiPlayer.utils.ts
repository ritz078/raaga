import { EVENT_TYPE } from "@enums/piano";
import {
  GLOBAL_HEADER_HEIGHT,
  PIANO_HEIGHT,
  WATERFALL_VISUALIZER_SCALE
} from "@config/piano";
import { INote } from "@utils/Midi/Midi";

export type NoteWithIdAndEvent = INote & {
  event: EVENT_TYPE;
  id: string;
  time: number;
};

export function getNotesWithNoteEndEvent(notes: INote[]): NoteWithIdAndEvent[] {
  let _notes: NoteWithIdAndEvent[] = [];

  notes.forEach((note) => {
    if (note.startTime === note.endTime) return;

    const id = `${note.pitch}_${note.startTime}_${note.endTime}`;
    _notes.push(
      {
        ...note,
        time: note.startTime,
        event: EVENT_TYPE.NOTE_START,
        id
      },
      {
        ...note,
        time: note.endTime,
        event: EVENT_TYPE.NOTE_STOP,
        id
      }
    );
  });

  _notes.sort((a, b) => b.time - a.time);

  _notes.find((note) => note.event === EVENT_TYPE.NOTE_STOP).event =
    EVENT_TYPE.PLAYING_COMPLETE;

  return _notes;
}

export function getDelay(offset = 0) {
  return (
    (window.innerHeight - PIANO_HEIGHT - GLOBAL_HEADER_HEIGHT) /
      WATERFALL_VISUALIZER_SCALE +
    offset
  );
}
