import { padStart } from "lodash";

export function formatTime(timeInSeconds: number) {
  const hours = Math.floor(timeInSeconds / (60 * 60)) || 0;
  const minutes = Math.floor((timeInSeconds - 60 * 60 * hours) / 60) || 0;
  const seconds =
    Math.floor(timeInSeconds - 60 * 60 * hours - 60 * minutes) || 0;

  const _hr = padStart(hours.toString(10), 2, "0");
  const _min = padStart(minutes.toString(10), 2, "0");
  const _sec = padStart(seconds.toString(10), 2, "0");
  return hours ? `${_hr}:${_min}:${_sec}` : `${_min}:${_sec}`;
}
