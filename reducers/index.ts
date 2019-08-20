import { combineReducers } from "redux";
import { recordings } from "./recordings";
import { midiDevice } from "./midiDevice";

export default combineReducers({
  recordings,
  midiDevice
});
