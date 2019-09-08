import CanvasWorker from "@workers/canvas.worker";

const worker = new CanvasWorker();

let isTransferableSupported = true;

const isOSSupported = !!HTMLCanvasElement.prototype.transferControlToOffscreen;

try {
  const _canvas = document.createElement("canvas");
  if (isOSSupported) {
    const canvas = _canvas.transferControlToOffscreen();
    // @ts-ignore
    worker.postMessage({ canvas }, [canvas]);
  }
} catch (e) {
  isTransferableSupported = false;
}

worker.terminate();

export const offScreenCanvasIsSupported =
  isOSSupported && isTransferableSupported;
