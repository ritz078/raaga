import {Track} from "midiconvert";
import {VISUALIZER_MODE} from "@enums/visualizerMessages";

export interface SoundPlayerState {
  instrument: string;
  loading: boolean;
	playerLoaded: boolean;
	activeMidis: number[];
	keyboardRange: {
		first: number;
		last: number;
	};
	currentTrack: Track;
	visualizerMode: VISUALIZER_MODE;
}
