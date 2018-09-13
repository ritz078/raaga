import { KeyboardShortcuts } from "react-piano";

export function getPianoRangeAndShortcuts(range: number[]) {
	const [first, last] = range;
  const keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: first,
    lastNote: last,
    keyboardConfig: KeyboardShortcuts.HOME_ROW
  });

  return { keyboardShortcuts, range: { first, last } };
}
