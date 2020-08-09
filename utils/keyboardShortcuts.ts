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

const keyboardEventToOctaveOffset = (event: KeyboardEvent): number => {
  return event.shiftKey ? 12 : event.ctrlKey ? -12 : 0;
};

const keyboardEventToMidi = (event: KeyboardEvent): number | null => {
  const midi = KEY_TO_MIDI[event.key.toLowerCase()];
  return midi ? midi + keyboardEventToOctaveOffset(event) : null;
};

export const useKeyboardShortcuts = (
  onPlay: (midi: number) => void,
  onStop: (midi: number) => void
) => {
  const activeMidiMapRef = useRef(new Set());
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const midi = keyboardEventToMidi(event);
      if (midi && !activeMidiMapRef.current.has(midi)) {
        activeMidiMapRef.current.add(midi);
        onPlay(midi);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      const midi = keyboardEventToMidi(event);
      if (midi && activeMidiMapRef.current.has(midi)) {
        activeMidiMapRef.current.delete(midi);
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
