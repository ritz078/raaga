import { combineReducers } from "redux";
import { loadedMidi } from "./loadedMidi";
import { selectedTrack } from "./selectedTrack";
import { recordings } from "./recordings";
import { midiDevice } from "./midiDevice";
import { midiHistory } from "./midiHistory";

export default combineReducers({
  loadedMidi,
  selectedTrack,
  recordings,
  midiDevice,
  midiHistory
});
