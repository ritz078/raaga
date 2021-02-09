import { useEffect, useRef } from "react";

// QWERTY keyboard shortcut to MIDI number
const KEY_TO_MIDI = {
  a: 60, // C4 in scientific pitch notation https://en.wikipedia.org/wiki/Scientific_pitch_notation#Table_of_note_frequencies
  w: 61, // D♭4
  s: 62, // D4
  e: 63, // E♭4
  d: 64, // E4
  f: 65, // F4
  t: 66, // G♭4
  g: 67, // G4
  y: 68, // A♭4
  h: 69, // A4
  u: 70, // B♭4
  j: 71, // B4
  k: 72 // C5
};

const OCTAVE_SEMITONES = 12; // there are 12 semitones in an octave

const keyboardEventToMidi = (event: KeyboardEvent): number | null => {
  const midi = KEY_TO_MIDI[event.key.toLowerCase()]; // C4 ~ C5 (e.g. The keyboard shortcut `a` is mapped to C4)
  if (!midi) {
    return null;
  }
  // hold the Shift key to raise the note by one octave (e.g. the keyboard shortcut `Shift+a` is mapped to C5)
  // hold the Control key to lower the note by one octave (e.g. the keyboard shortcut `Ctrl+a` is mapped to C3)
  return (
    midi + (event.shiftKey ? 1 : event.ctrlKey ? -1 : 0) * OCTAVE_SEMITONES
  );
};

export const useKeyboardShortcuts = (
  onPlay: (midi: number) => void,
  onStop: (midi: number) => void
) => {
  const activeMidisRef = useRef(new Set());
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const midi = keyboardEventToMidi(event);
      if (midi && !activeMidisRef.current.has(midi)) {
        activeMidisRef.current.add(midi);
        onPlay(midi);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      const midi = keyboardEventToMidi(event);
      if (midi && activeMidisRef.current.has(midi)) {
        activeMidisRef.current.delete(midi);
        onStop(midi);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [onPlay, onStop]);
};
