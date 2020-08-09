import { useEffect, useRef } from "react";

const KEY_TO_MIDI = {
  a: 60,
  w: 61,
  s: 62,
  e: 63,
  d: 64,
  f: 65,
  t: 66,
  g: 67,
  y: 68,
  h: 69,
  u: 70,
  j: 71,
  k: 72
};

const OCTAVE_SEMITONES = 12;

const keyboardEventToMidi = (event: KeyboardEvent): number | null => {
  const midi = KEY_TO_MIDI[event.key.toLowerCase()];
  return midi
    ? midi + (event.shiftKey ? 1 : event.ctrlKey ? -1 : 0) * OCTAVE_SEMITONES
    : null;
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
