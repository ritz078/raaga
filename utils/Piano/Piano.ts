import accidentalKey from "@assets/images/accidental-key.png";
import naturalKey from "@assets/images/natural-key.png";
import {
  getAllMidiNumbersInRange,
  getNaturalKeyWidthRatio,
  getRelativeKeyPosition
} from "@utils";
import { Dimensions, Range } from "@utils/typings/Visualizer";
import { MidiNumbers } from "piano-utils";

export class Piano {
  ctx: CanvasRenderingContext2D;
  range: Range;
  dimensions: Dimensions;

  static dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI
      .split(",")[0]
      .split(":")[1]
      .split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  constructor(canvas: HTMLCanvasElement, range: Range, dimensions: Dimensions) {
    this.ctx = canvas.getContext("2d");
    this.range = range;
    this.setDimensions(dimensions);
    this.renderNotes();
  }

  private setAccidentalNote = async (
    left: number,
    width: number,
    height: number
  ) => {
    const bitMap = await createImageBitmap(Piano.dataURItoBlob(accidentalKey));
    this.ctx.drawImage(bitMap, left, 0, width, height);
  };

  private getNaturalNote = (width: number, height: number) => {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

    ctx.fillStyle = "white";
    ctx.strokeStyle = "#000";
    ctx.rect(0, 0, width, height);

    ctx.fill();
    ctx.stroke();
    return canvas;
  };

  private setNaturalNote = (canvas: OffscreenCanvas, left: number) => {
    this.ctx.drawImage(canvas, left, 0);
  };

  public setRange = (range: Range) => {
    this.range = range;
    this.renderNotes();
  };

  public setDimensions = (dimensions: Dimensions) => {
    this.dimensions = dimensions;
    this.ctx.canvas.width = dimensions.width;
    this.ctx.canvas.height = dimensions.height;
  };

  private renderNotes = () => {
    const range = this.range;
    const { height, width } = this.dimensions;

    const naturalKeyWidth = getNaturalKeyWidthRatio(range);
    const naturalKeyCanvas = this.getNaturalNote(
      naturalKeyWidth * width,
      height
    );

    const midis = getAllMidiNumbersInRange(range);
    midis.map(midi => {
      const { isAccidental } = MidiNumbers.getAttributes(midi);
      const _left =
        getRelativeKeyPosition(midi, range) * naturalKeyWidth * width;
      const _width =
        (isAccidental ? 0.65 * naturalKeyWidth : naturalKeyWidth) * width;

      if (isAccidental) {
        this.setAccidentalNote(_left, _width, 0.5 * height);
      } else {
        this.setNaturalNote(naturalKeyCanvas, _left);
      }
    });
  };
}
