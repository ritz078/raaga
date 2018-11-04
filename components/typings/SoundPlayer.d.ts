import { MIDI, Track } from "midiconvert";
import { Dispatch } from "redux";
import { Settings } from "@reducers/settings";

export interface SoundPlayerProps {
  settings: Settings;
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
  isPlaying: boolean;
  isRecording: boolean;
}
