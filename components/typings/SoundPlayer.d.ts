import { MIDI, Track } from "midiconvert";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import { Dispatch } from "redux";

export interface SoundPlayerProps {
  settings: any;
  dispatch: Dispatch;
  loadedMidi: MIDI;
  selectedTrack: Track;
}

export interface SoundPlayerState {
  instrument: string;
  loading: boolean;
  activeMidis: number[];
  keyboardRange: {
    first: number;
    last: number;
  };
  mode: VISUALIZER_MODE;
  isPlaying: boolean;
}
