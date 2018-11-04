const ab = ArrayBuffer && new ArrayBuffer(1);

// @ts-ignore
export const offScreenCanvasIsSupported =
  !!HTMLCanvasElement.prototype.transferControlToOffscreen &&
  ab &&
  !ab.byteLength;
