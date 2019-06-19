import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import { Midi, Track } from "@typings/midi";

export interface Store {
  selectedTrack: Track;
  loadedMidi: Midi;
  settings: {
    mode: VISUALIZER_MODE;
  };
  recordings: (Midi & {
    id: string;
  })[];
  midiHistory: (Midi & {
    id: string;
  })[];
  midiDevice: string;
}
