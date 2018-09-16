import { combineReducers } from "redux";
import { settings } from "./settings";
import { loadedMidi } from "./loadedMidi";
import { selectedTrack } from "./selectedTrack";

export default combineReducers({
  settings,
  loadedMidi,
  selectedTrack
});
