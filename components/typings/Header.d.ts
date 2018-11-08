import { AnyAction, Dispatch } from "redux";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import * as React from "react";
import { MIDI, Note } from "midiconvert";
import { Store } from "@typings/store";

export interface HeaderProps {
  dispatch: Dispatch<AnyAction>;
  mode: VISUALIZER_MODE;
  instrument: string;
  onTogglePlay: () => void;
  onInstrumentChange: (instrument: React.ReactText) => void;
  isRecording: boolean;
  toggleRecording: () => void;
  notes?: Note[];
  recordings: Store["recordings"];
  onTrackSelect: (midi: MIDI, i) => void;
  midiDeviceId: string;
  onToggleMode: (mode: VISUALIZER_MODE) => void;
  onToggleSidebar: () => void;
}
