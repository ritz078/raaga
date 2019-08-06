import { Dispatch } from "redux";
import { Settings } from "@reducers/settings";
import { Store } from "@typings/store";
import { Midi, Track } from "@typings/midi";

export interface SoundPlayerProps {
  settings: Settings;
  dispatch: Dispatch;
  loadedMidi: Midi;
  selectedTrack: Track;
  recordings: Store["recordings"];
  midiHistory: Store["midiHistory"];
  midiDevice: string;
  isCounterRunning: boolean;
}
