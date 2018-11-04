import { AnyAction, Dispatch } from "redux";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import * as React from "react";

export interface HeaderProps {
  dispatch: Dispatch<AnyAction>;
  mode: VISUALIZER_MODE;
  instrument: string;
  onTogglePlay: () => void;
  onInstrumentChange: (instrument: React.ReactText) => void;
  isRecording: boolean;
  toggleRecording: () => void;
}
