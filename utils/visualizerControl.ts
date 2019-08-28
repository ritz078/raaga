import {
  VISUALIZER_MESSAGES,
  VISUALIZER_MODE
} from "@enums/visualizerMessages";
import { Visualizer } from "@utils/Visualizer";
import { Dimensions, Range } from "@utils/typings/Visualizer";
import { ITrack } from "@typings/midi";

export interface IData {
  canvas: {
    getContext: (x: string) => CanvasRenderingContext2D;
  };
  track: ITrack;
  message: VISUALIZER_MESSAGES;
  range: Range;
  dimensions: Dimensions;
  midi: number;
  mode: VISUALIZER_MODE;
  delay: number;
  speed: number;
}

let visualizer;

export function controlVisualizer(data: Partial<IData>) {
  const {
    canvas,
    track,
    message,
    range,
    dimensions,
    midi,
    mode,
    delay,
    speed
  } = data;
  try {
    if (message === VISUALIZER_MESSAGES.INIT) {
      visualizer = new Visualizer(canvas, dimensions, range, mode);
    } else if (message === VISUALIZER_MESSAGES.UPDATE_DIMENSIONS) {
      visualizer.setDimensions(dimensions);
    } else if (message === VISUALIZER_MESSAGES.UPDATE_RANGE) {
      visualizer.setRange(range);
    } else if (message === VISUALIZER_MESSAGES.PLAY_TRACK) {
      visualizer.setRange(range);
      visualizer.play(track, delay);
    } else if (message === VISUALIZER_MESSAGES.STOP_TRACK) {
      visualizer.cleanup();
    } else if (message === VISUALIZER_MESSAGES.PLAY_NOTE) {
      visualizer.addNote(midi);
    } else if (message === VISUALIZER_MESSAGES.STOP_NOTE) {
      visualizer.endNote(midi);
    } else if (message === VISUALIZER_MESSAGES.SET_MODE) {
      visualizer.setMode(mode);
    } else if (message === VISUALIZER_MESSAGES.TOGGLE) {
      visualizer.toggle();
    } else if (message === VISUALIZER_MESSAGES.SET_SPEED) {
      visualizer && visualizer.setSpeed(speed);
    }
  } catch (e) {
    console.log(e);
  }
}
