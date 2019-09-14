import TestCanvasSupport from "@workers/testCanvasSupport.worker";
import { transfer, wrap } from "comlink";
import { OFFSCREEN_2D_CANVAS_SUPPORT } from "@enums/offscreen2dCanvasSupport";

const testProxy: any = wrap(new TestCanvasSupport());

export async function checkSupportFor2dOffscreenCanvas() {
  const canvas = document.createElement("canvas");
  try {
    const _canvas: any = canvas.transferControlToOffscreen();
    return await testProxy(transfer(_canvas, [_canvas]));
  } catch (e) {
    return OFFSCREEN_2D_CANVAS_SUPPORT.NOT_SUPPORTED;
  }
}
