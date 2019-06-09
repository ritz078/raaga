import { MIDI } from "midiconvert";
import { Dispatch } from "redux";

export interface PlayerControllerProps {
  midi: MIDI;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onTrackSelect: (midi: MIDI, i: number) => void;
  onStartPlay: () => void;
  style?: any;
  onReplay?: () => void;
  onToggleSidebar: () => void;
  dispatch: Dispatch;
  isCounterRunning: boolean;
}
