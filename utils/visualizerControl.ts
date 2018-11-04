import {
  VISUALIZER_MESSAGES,
  VISUALIZER_MODE
} from "@enums/visualizerMessages";
import { Visualizer } from "@utils/Visualizer";
import { Track } from "midiconvert";
import { Dimensions, Range } from "@utils/typings/Visualizer";

export interface Data {
  canvas: {
    getContext: (x: string) => CanvasRenderingContext2D;
  };
  track: Track;
  message: VISUALIZER_MESSAGES;
  range: Range;
  dimensions: Dimensions;
  midi: number;
  mode: VISUALIZER_MODE;
}

let visualizer, intervalId;

export function controlVisualizer(data: Partial<Data>) {
  const { canvas, track, message, range, dimensions, midi, mode } = data;
  if (message === VISUALIZER_MESSAGES.INIT) {
    clearInterval(intervalId);
    visualizer = new Visualizer(canvas, dimensions, range, mode);
  } else if (message === VISUALIZER_MESSAGES.UPDATE_DIMENSIONS) {
    visualizer.setDimensions(dimensions);
  } else if (message === VISUALIZER_MESSAGES.UPDATE_RANGE) {
    visualizer.setRange(range);
  } else if (message === VISUALIZER_MESSAGES.PLAY_TRACK) {
    visualizer.setRange(range);
    visualizer.play(track);
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
  }
}
