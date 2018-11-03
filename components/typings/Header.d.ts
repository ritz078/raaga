import { AnyAction, Dispatch } from "redux";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import { MIDI } from "midiconvert";

export interface HeaderProps {
  dispatch: Dispatch<AnyAction>;
  mode: VISUALIZER_MODE;
  instrument: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  settings: {
    mode: VISUALIZER_MODE;
  };
}

export interface HeaderState {
  mute: boolean;
}
