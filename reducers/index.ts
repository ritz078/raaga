import { combineReducers } from "redux";
import { settings } from "./settings";
import { loadedMidi } from "./loadedMidi";
import { selectedTrack } from "./selectedTrack";
import { recordings } from "./recordings";
import { midiDevice } from "./midiDevice";
import { midiHistory } from "./midiHistory";
import { uiState } from "./uiState";

export default combineReducers({
  settings,
  loadedMidi,
  selectedTrack,
  recordings,
  midiDevice,
  midiHistory,
  uiState
});
