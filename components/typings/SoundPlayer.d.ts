import { Dispatch } from "redux";
import { Settings } from "@reducers/settings";
import { Store } from "@typings/store";
import { Midi, ITrack } from "@typings/midi";

export interface SoundPlayerProps {
  settings: Settings;
  dispatch: Dispatch;
  loadedMidi: Midi;
  selectedTrack: ITrack;
  midiDevice: string;
  isCounterRunning: boolean;
}
