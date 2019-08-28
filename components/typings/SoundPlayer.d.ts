import { Settings } from "@reducers/settings";
import { Midi, ITrack } from "@typings/midi";

export interface SoundPlayerProps {
  settings: Settings;
  loadedMidi: Midi;
  selectedTrack: ITrack;
  midiDevice: string;
  isCounterRunning: boolean;
}
