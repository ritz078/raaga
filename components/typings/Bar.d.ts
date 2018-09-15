import { Track } from "midiconvert";

export interface BarProps {
  noteRange: {
    first: number;
    last: number;
  };
  readOnly?: boolean;
  track: Track;
  bpm?: number;
  progress?: number;
}
