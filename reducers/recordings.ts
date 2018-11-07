import { createReducer } from "@utils/createReducer";
import { ReducersType } from "@enums/reducers";

export const recordings = createReducer([], {
  [ReducersType.SAVE_RECORDING]: (_state, action) => [
    ..._state,
    ...[action.payload]
  ]
});
