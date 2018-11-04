import { AnyAction, Dispatch } from "redux";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";

export interface HeaderProps {
  dispatch: Dispatch<AnyAction>;
  mode: VISUALIZER_MODE;
  instrument: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
}
