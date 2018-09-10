import { KeyboardShortcuts, MidiNumbers } from "react-piano";

export function getPianoRangeAndShortcuts(startNode: string, endNote: string) {
  const firstNote = MidiNumbers.fromNote(startNode);
  const lastNote = MidiNumbers.fromNote(endNote);

  const keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: firstNote,
    lastNote: lastNote,
    keyboardConfig: KeyboardShortcuts.HOME_ROW
  });

  return { keyboardShortcuts, range: { first: firstNote, last: lastNote } };
}
