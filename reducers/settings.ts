import { createReducer } from "@utils/createReducer";
import { ReducersType } from "@enums/reducers";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";

export const settings = createReducer(
  {
    mode: VISUALIZER_MODE.WRITE
  },
  {
    [ReducersType.CHANGE_SETTINGS]: (state, action) => ({
      ...state,
      ...action.payload
    })
  }
);
