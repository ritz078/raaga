type Func = (midiNumber: number) => void;

export interface SoundPlayerProps {
  children: (
    args: {
      play: Func;
      stop: Func;
      loading: boolean;
    }
  ) => JSX.Element;
}

export interface SoundPlayerState {
  instrument: string;
  loading: boolean;
	playerLoaded: boolean;
}
