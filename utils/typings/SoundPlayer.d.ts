import {
  VISUALIZER_MESSAGES,
  VISUALIZER_MODE
} from "@enums/visualizerMessages";
import { Track } from "midiconvert";
import { Range } from "@utils/typings/Visualizer";

interface Message {
  message: VISUALIZER_MESSAGES;
  canvas?: HTMLCanvasElement;
  dimensions?: Partial<ClientRect>;
  range?: Range;
  track?: Track;
  midi?: number;
  mode?: VISUALIZER_MODE;
}

export interface CanvasWorkerInterface extends Worker {
  postMessage(message: Message, transfer?: any[]): void;
}
