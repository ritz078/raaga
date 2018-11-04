const ab = ArrayBuffer && new ArrayBuffer(1);

export const offScreenCanvasIsSupported =
  // @ts-ignore
  !!HTMLCanvasElement.prototype.transferControlToOffscreen &&
  ab &&
  !ab.byteLength;
