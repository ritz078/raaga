export interface SoundPlayerState {
  instrument: string;
  loading: boolean;
	playerLoaded: boolean;
	activeMidis: number[];
	keyboardRange: {
		first: number;
		last: number;
	};
}
