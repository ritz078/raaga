import { combineReducers } from "redux";
import { settings } from "./settings";
import { loadedMidi } from "./loadedMidi";
import { selectedTrack } from "./selectedTrack";
import { recordings } from "./recordings";
import { midiDevice } from "./midiDevice";

export default combineReducers({
  settings,
  loadedMidi,
  selectedTrack,
  recordings,
  midiDevice
});
