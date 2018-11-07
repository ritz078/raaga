import { MIDI, Track } from "midiconvert";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";

export interface Store {
  selectedTrack: Track;
  loadedMidi: MIDI;
  settings: {
    mode: VISUALIZER_MODE;
  };
  recordings: (MIDI & {
    id: string;
  })[];
  midiDevice: string;
}
