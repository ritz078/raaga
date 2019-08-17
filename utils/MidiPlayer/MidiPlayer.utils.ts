import { MidiJSON, Note, Track } from "@utils/midiParser/midiParser";
import { EVENT_TYPE } from "@enums/piano";
import { PIANO_HEIGHT, TRACK_PLAYING_SPEED } from "@config/piano";

export type NoteWithIdAndEvent = Note & {
  event: EVENT_TYPE;
  id: Symbol;
};

export function getNotesWithNoteEndEvent(notes: Note[]): NoteWithIdAndEvent[] {
  const _notes = [];

  notes.forEach((note, i) => {
    const id = Symbol(note.name);
    const time = note.time + note.duration;
    _notes.push(
      {
        ...note,
        time: note.time,
        event: EVENT_TYPE.NOTE_START,
        id
      },
      {
        ...note,
        time,
        event: EVENT_TYPE.NOTE_STOP,
        id
      }
    );

    if (i === notes.length - 1) {
      _notes.push({
        ...note,
        time,
        event: EVENT_TYPE.PLAYING_COMPLETE,
        id
      });
    }
  });

  return _notes;
}

export function getDelay(offset = 0) {
  return (window.innerHeight - PIANO_HEIGHT) / TRACK_PLAYING_SPEED + offset;
}

export function getTrackWithDelay(track: Track, delay = 0) {
  return {
    ...track,
    notes: track.notes.map(_note => ({
      ..._note,
      duration: _note.duration,
      time: _note.time + delay
    })),
    duration: track.duration + delay
  };
}
