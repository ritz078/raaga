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
  player: {
    play: Func;
    stop: Func;
  };
  instrument: string;
  loading: boolean;
}
