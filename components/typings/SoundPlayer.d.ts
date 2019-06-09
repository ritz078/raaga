import { MIDI, Note, Track } from "midiconvert";
import { Dispatch } from "redux";
import { Settings } from "@reducers/settings";
import { Store } from "@typings/store";

export interface SoundPlayerProps {
  settings: Settings;
  dispatch: Dispatch;
  loadedMidi: MIDI;
  selectedTrack: Track;
  recordings: Store["recordings"];
  midiHistory: Store["midiHistory"];
  midiDevice: string;
  isCounterRunning: boolean;
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
  recordedNotes?: Partial<Note>[] | void;
  showSidebar: boolean;
}
