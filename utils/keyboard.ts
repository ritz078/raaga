import { MidiNumbers, KeyboardShortcuts } from "piano-utils";
import { range, findLast, find } from "lodash";
import { Range } from "@utils/typings/Visualizer";
import { INote } from "@typings/midi";
import { MINIMUM_KEYS_IN_READ_MODE } from "@config/piano";

const pitchPositions = {
  C: 0,
  Db: 0.55,
  D: 1,
  Eb: 1.8,
  E: 2,
  F: 3,
  Gb: 3.5,
  G: 4,
  Ab: 4.7,
  A: 5,
  Bb: 5.85,
  B: 6
};

export function getMidiRange(notes: INote[]) {
  const midis = notes.map(note => note.midi);
  return [Math.min(...midis), Math.max(...midis)];
}

export function isWithinRange(toCheck: number[], range: number[]) {
  return range[0] <= toCheck[0] && range[1] >= toCheck[1];
}

export function getAllMidiNumbersInRange(_range: Range): number[] {
  return range(_range.first, _range.last + 1);
}

export function getNaturalKeysInRange(range: Range) {
  return getAllMidiNumbersInRange(range).filter(
    midi => !MidiNumbers.getAttributes(midi).isAccidental
  );
}

export function getNaturalKeyWidthRatio(range: Range): number {
  return 1 / getNaturalKeysInRange(range).length;
}

function getAbsoluteKeyPosition(midiNumber: number): number {
  const OCTAVE_WIDTH = 7;
  const { octave, pitchName } = MidiNumbers.getAttributes(midiNumber);
  const pitchPosition = pitchPositions[pitchName];
  const octavePosition = OCTAVE_WIDTH * octave;
  return pitchPosition + octavePosition;
}

export function getRelativeKeyPosition(
  midiNumber: number,
  range: Range
): number {
  return (
    getAbsoluteKeyPosition(midiNumber) - getAbsoluteKeyPosition(range.first)
  );
}

const naturalMidiNumbers = MidiNumbers.NATURAL_MIDI_NUMBERS;

export function getPianoRangeAndShortcuts(range: number[], autoSet = true) {
  const [first, last] = range;

  const _first = autoSet
    ? findLast(naturalMidiNumbers, midi => midi < first)
    : first;
  const _last = autoSet
    ? last - first > MINIMUM_KEYS_IN_READ_MODE
      ? find(naturalMidiNumbers, midi => midi > last)
      : find(
          naturalMidiNumbers,
          midi => midi > first + MINIMUM_KEYS_IN_READ_MODE
        )
    : last;

  const keyboardShortcuts = KeyboardShortcuts.create({
    firstNote: _first,
    lastNote: _last,
    keyboardConfig: KeyboardShortcuts.HOME_ROW
  });

  return { keyboardShortcuts, range: { first: _first, last: _last } };
}
