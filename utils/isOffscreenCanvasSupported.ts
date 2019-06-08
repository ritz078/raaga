import CanvasWorker from "@workers/canvas.worker";

const worker = new CanvasWorker();

let isTranferableSupported = true;

const isOSSupported = !!HTMLCanvasElement.prototype.transferControlToOffscreen;

try {
  const _canvas = document.createElement("canvas");
  if (isOSSupported) {
    const canvas = _canvas.transferControlToOffscreen();
    // @ts-ignore
    worker.postMessage({ canvas }, [canvas]);
  }
} catch (e) {
  isTranferableSupported = false;
}

export const offScreenCanvasIsSupported =
  isOSSupported && isTranferableSupported;
