import { createReducer } from "@utils/createReducer";
import { ReducersType } from "@enums/reducers";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";

export interface Settings {
  mode: VISUALIZER_MODE;
}

export const settings = createReducer(
  {
    mode: VISUALIZER_MODE.READ
  },
  {
    [ReducersType.CHANGE_SETTINGS]: (state, action) => ({
      ...state,
      ...action.payload
    })
  }
);
