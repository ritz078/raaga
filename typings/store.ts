import { VISUALIZER_MODE } from "@enums/visualizerMessages";

export interface Store {
  settings: {
    mode: VISUALIZER_MODE;
  };
  midiDevice: string;
}
