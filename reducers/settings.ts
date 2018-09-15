import {createReducer} from "@utils/createReducer";
import {ReducersType} from "@enums/reducers";

export const settings = createReducer([], {
	[ReducersType.CHANGE_SETTINGS]: (state, action) => {
		const text = action.text.trim()
		return [...state, text]
	}
});
