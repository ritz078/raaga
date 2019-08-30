import {
  VISUALIZER_MESSAGES,
  VISUALIZER_MODE
} from "@enums/visualizerMessages";
import { Range } from "@utils/typings/Visualizer";
import { ITrack } from "@typings/midi";

interface Message {
  message: VISUALIZER_MESSAGES;
  canvas?: HTMLCanvasElement;
  dimensions?: Partial<ClientRect>;
  range?: Range;
  track?: ITrack;
  midi?: number;
  mode?: VISUALIZER_MODE;
}
