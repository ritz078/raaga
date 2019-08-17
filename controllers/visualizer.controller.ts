import CanvasWorker from "@workers/canvas.worker";
import { controlVisualizer, Data } from "@utils/visualizerControl";
import { offScreenCanvasIsSupported } from "@utils/isOffscreenCanvasSupported";

export class CanvasWorkerFallback {
  postMessage(data, _transferable?) {
    controlVisualizer(data);
  }
}

export default offScreenCanvasIsSupported ? CanvasWorker : CanvasWorkerFallback;
