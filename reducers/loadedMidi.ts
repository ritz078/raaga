import { createReducer } from "@utils/createReducer";
import { ReducersType } from "@enums/reducers";

export const loadedMidi = createReducer(
  {},
  {
    [ReducersType.LOADED_MIDI]: (_state, action) => action.payload
  }
);
