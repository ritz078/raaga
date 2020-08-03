import { Range } from "@utils/typings/Visualizer";

export const TRACK_PLAYING_SPEED = 100;
export const HORIZONTAL_GAP_BETWEEN_NOTES = 2;
export const MS_PER_SECOND = 10;
export const PIANO_HEIGHT = 210;
export const ACCIDENTAL_KEY_COLOR = "#ffdc66";
export const NATURAL_KEY_COLOR = "#42C9FF";
export const RADIUS = 3;
export const GLOBAL_HEADER_HEIGHT = 50;
export const MINIMUM_KEYS_IN_READ_MODE = 40;

const DEFAULT_RANGE: Range = { first: 36, last: 84 }; // 49 keys: C2 - C6

export const getDefaultRange = (): Range => {
  const range = window.localStorage.getItem("range");
  if (range) {
    try {
      const { first, last } = JSON.parse(range);
      return { first, last };
    } catch (e) {}
  }
  return DEFAULT_RANGE;
};

export const setDefaultRange = (range: Range) =>
  window.localStorage.setItem("range", JSON.stringify(range));
