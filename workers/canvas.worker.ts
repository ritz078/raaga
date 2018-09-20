import {
  VISUALIZER_MESSAGES,
  VISUALIZER_MODE
} from "@enums/visualizerMessages";
import { Track } from "midiconvert";
import { Visualizer } from "@utils/Visualizer";
import { Dimensions, Range } from "@utils/typings/Visualizer";

let visualizer, intervalId;

interface Data {
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

self.onmessage = e => {
  const {
    canvas,
    track,
    message,
    range,
    dimensions,
    midi,
    mode
  }: Data = e.data;

  if (message === VISUALIZER_MESSAGES.INIT) {
    clearInterval(intervalId);
    visualizer = new Visualizer(canvas, dimensions, range);
  } else if (message === VISUALIZER_MESSAGES.UPDATE_DIMENSIONS) {
    visualizer.setDimensions(dimensions);
  } else if (message === VISUALIZER_MESSAGES.UPDATE_RANGE) {
    visualizer.setRange(range);
  } else if (message === VISUALIZER_MESSAGES.PLAY) {
    visualizer.setRange(range);
    visualizer.play(track);
  } else if (message === VISUALIZER_MESSAGES.STOP) {
    visualizer.cleanup();
  } else if (message === VISUALIZER_MESSAGES.ADD_NOTE) {
    visualizer.addNote(midi);
  } else if (message === VISUALIZER_MESSAGES.END_NOTE) {
    visualizer.endNote(midi);
  } else if (message === VISUALIZER_MESSAGES.SET_MODE) {
    visualizer.setMode(mode);
  } else if (message === VISUALIZER_MESSAGES.TOGGLE) {
    visualizer.toggle();
  }
};
