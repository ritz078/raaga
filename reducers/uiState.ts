import { createReducer } from "@utils/createReducer";
import { ReducersType } from "@enums/reducers";

export interface UiState {
  isCounterRunning: boolean;
}

export const uiState = createReducer(
  {
    isCounterRunning: false
  },
  {
    [ReducersType.TOGGLE_COUNTER_STATUS]: (state, action) => ({
      ...state,
      isCounterRunning: action.payload
    })
  }
);
