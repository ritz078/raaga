import {VISUALIZER_MESSAGES} from "@enums/visualizerMessages";
import {Track} from "midiconvert";
import {Visualizer} from "@utils/Visualizer";

interface Range {
  first: number;
  last: number;
}

interface Dimensions {
  width: number;
  height: number;
}

let visualizer, intervalId;

interface Data {
  canvas: {
    getContext: (x: string) => CanvasRenderingContext2D;
  };
  track: Track;
  message: VISUALIZER_MESSAGES;
  range: Range;
  dimensions: Dimensions;
}

self.onmessage = e => {
  const { canvas, track, message, range, dimensions }: Data = e.data;

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
  	visualizer.stop();
	}
};
