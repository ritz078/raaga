import { createReducer } from "@utils/createReducer";
import { ReducersType } from "@enums/reducers";

export const midiDevice = createReducer(null, {
  [ReducersType.SET_MIDI_DEVICE]: (_state, action) => action.payload
});
