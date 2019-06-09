import { MIDI, Track } from "midiconvert";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import { UiState } from "../reducers/uiState";

export interface Store {
  selectedTrack: Track;
  loadedMidi: MIDI;
  settings: {
    mode: VISUALIZER_MODE;
  };
  recordings: (MIDI & {
    id: string;
  })[];
  midiHistory: (MIDI & {
    id: string;
  })[];
  midiDevice: string;
  uiState: UiState;
}
