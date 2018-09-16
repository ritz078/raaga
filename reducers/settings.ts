import { createReducer } from "@utils/createReducer";
import { ReducersType } from "@enums/reducers";

export const settings = createReducer(
  {},
  {
    [ReducersType.CHANGE_SETTINGS]: (state, action) => ({
      ...state,
      ...action.payload
    })
  }
);
