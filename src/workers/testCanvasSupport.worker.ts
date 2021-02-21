import { OFFSCREEN_2D_CANVAS_SUPPORT } from "@enums/offscreen2dCanvasSupport";

self.onmessage = ev => {
  const { id, message: canvas } = ev.data;

  try {
    canvas.getContext("2d");
    self.postMessage({
      id,
      message: OFFSCREEN_2D_CANVAS_SUPPORT.SUPPORTED
    });
  } catch (e) {
    self.postMessage({
      id,
      message: OFFSCREEN_2D_CANVAS_SUPPORT.NOT_SUPPORTED
    });
  }
};
