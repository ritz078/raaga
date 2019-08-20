import { EVENT_TYPE } from "@enums/piano";
import {
  VISUALIZER_MESSAGES,
  VISUALIZER_MODE
} from "@enums/visualizerMessages";
import { Range } from "@utils/typings/Visualizer";
import { INote, Track } from "@typings/midi";

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

export interface Sampler {
  connect: (master: any) => void;
  triggerAttack: (note: string, time?: number, velocity?: number) => void;
  triggerRelease: (note: string) => void;
  add: (key: string, buffer: ArrayBuffer, cb: () => void) => void;
  context: AudioContext;
  dispose: () => void;
  triggerAttackRelease: (
    note: string,
    duration: number,
    time: number,
    velocity: number
  ) => void;
}

export interface NoteWithEvent extends INote {
  event: EVENT_TYPE;
  id: string;
}
