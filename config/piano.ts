import { Range } from "@utils/typings/Visualizer";
import { Theme } from "@utils/typings/Theme";

export const TRACK_PLAYING_SPEED = 100;
export const HORIZONTAL_GAP_BETWEEN_NOTES = 2;
export const MS_PER_SECOND = 10;
export const PIANO_HEIGHT = 210;
export const DEFAULT_THEME: Theme = {
  naturalColor: "#42C9FF",
  accidentalColor: "#FFDC66"
};
export const RADIUS = 3;
export const GLOBAL_HEADER_HEIGHT = 50;
export const MINIMUM_KEYS_IN_READ_MODE = 40;

export const RANGE_PRESETS: Range[] = [
  { first: 48, last: 72 }, // 25 keys: C3 - C5
  { first: 41, last: 72 }, // 32 keys: F2 - C5
  { first: 48, last: 84 }, // 37 keys: C3 - C6
  { first: 36, last: 84 }, // 49 keys: C2 - C6
  { first: 36, last: 96 }, // 61 keys: C2 - C7
  { first: 21, last: 108 } // 88 keys: A0 - C8
];

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
