import CanvasWorker from "@workers/canvas.worker";

const worker = new CanvasWorker();

let isTranferableSupported = true;

const isOffscreenCanvasSupported = !!HTMLCanvasElement.prototype
  .transferControlToOffscreen;

try {
  const _canvas = document.createElement("canvas");
  if (isOffscreenCanvasSupported) {
    // @ts-ignore
    const canvas = _canvas.transferControlToOffscreen();
    worker.postMessage({ canvas }, [canvas]);
  }
} catch (e) {
  isTranferableSupported = false;
}

export const offScreenCanvasIsSupported =
  isOffscreenCanvasSupported && isTranferableSupported;
