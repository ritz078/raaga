import {
  VISUALIZER_MESSAGES,
  VISUALIZER_MODE
} from "@enums/visualizerMessages";
import { Range } from "@utils/typings/Visualizer";
import { ITrackSequence } from "@utils/Midi/Midi";

interface Message {
  message: VISUALIZER_MESSAGES;
  canvas?: HTMLCanvasElement;
  dimensions?: Partial<ClientRect>;
  range?: Range;
  track?: ITrackSequence;
  midi?: number;
  mode?: VISUALIZER_MODE;
}
