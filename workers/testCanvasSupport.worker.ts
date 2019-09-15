import { expose } from "comlink";
import { OFFSCREEN_2D_CANVAS_SUPPORT } from "@enums/offscreen2dCanvasSupport";

function testCanvasSupport(canvas: HTMLCanvasElement) {
  try {
    canvas.getContext("2d");
    return OFFSCREEN_2D_CANVAS_SUPPORT.SUPPORTED;
  } catch (e) {
    return OFFSCREEN_2D_CANVAS_SUPPORT.NOT_SUPPORTED;
  }
}

expose(testCanvasSupport);
