import CanvasWorker from "@workers/canvas.worker";
import { controlVisualizer } from "@utils/visualizerControl";
import { offScreenCanvasIsSupported } from "@utils/isOffscreenCanvasSupported";
import { wrap } from "comlink";

export default offScreenCanvasIsSupported
  ? wrap(new CanvasWorker())
  : controlVisualizer;
