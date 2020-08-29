import TestCanvasSupport from "@workers/testCanvasSupport.worker";
import { OFFSCREEN_2D_CANVAS_SUPPORT } from "@enums/offscreen2dCanvasSupport";
import { promisifyWorker } from "@utils/promisifyWorker";

const testProxy = promisifyWorker(new TestCanvasSupport());

export async function checkSupportFor2dOffscreenCanvas() {
  const canvas = document.createElement("canvas");
  try {
    const _canvas: any = canvas.transferControlToOffscreen();
    return await testProxy(_canvas, [_canvas]);
  } catch (e) {
    return OFFSCREEN_2D_CANVAS_SUPPORT.NOT_SUPPORTED;
  }
}
