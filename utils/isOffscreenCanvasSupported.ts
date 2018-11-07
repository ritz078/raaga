import CanvasWorker from "@workers/canvas.worker";

const worker = new CanvasWorker();

let isTranferableSupported = true;

// @ts-ignore
const isOSSupported = !!HTMLCanvasElement.prototype.transferControlToOffscreen;

try {
  const _canvas = document.createElement("canvas");
  if (isOSSupported) {
    // @ts-ignore
    const canvas = _canvas.transferControlToOffscreen();
    worker.postMessage({ canvas }, [canvas]);
  }
} catch (e) {
  isTranferableSupported = false;
}

export const offScreenCanvasIsSupported =
  isOSSupported && isTranferableSupported;
