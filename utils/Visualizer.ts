import { MidiNumbers } from "react-piano";
import { groupBy } from "lodash";
import { Track } from "midiconvert";
import {
  getAllMidiNumbersInRange,
  getNaturalKeyWidthRatio,
  getRelativeKeyPosition
} from "@utils/keyboard";
import { Dimensions, Range } from "@utils/typings/Visualizer";

const SPEED = 1000;
const RADIUS = 10;
const HORIZONTAL_MARGIN = 2;

export class Visualizer {
  ctx: CanvasRenderingContext2D;
  range: Range;
  intervalId: number;

  constructor(canvas, dimensions, range) {
    this.ctx = canvas.getContext("2d");
    this.range = range;
    this.setDimensions(dimensions);
  }

  public setDimensions = ({ width, height }: Dimensions) => {
    this.ctx.canvas.width = width;
    this.ctx.canvas.height = height;
  };

  public play = (track: Track) => {
    let offset = 0;
    this.intervalId = self.setInterval(() => {
      this.createNoteBlocks(track, offset);
      offset -= 4;
    }, 4);
  };

  public stop = () => {
    clearInterval(this.intervalId);
    this.clearCanvas();
  };

  private clearCanvas = () =>
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

  private createNoteBlocks = (track: Track, offset: number) => {
    this.clearCanvas();

    const _midiNumbers = getAllMidiNumbersInRange(this.range);
    const _groupedNotes = groupBy(track && track.notes, "midi");

    const trackHeight = track.duration * SPEED;

    const _width = this.ctx.canvas.width;
    const _height = this.ctx.canvas.height;

    const naturalKeyWidth = getNaturalKeyWidthRatio(this.range);

    _midiNumbers.forEach(midi => {
      if (!_groupedNotes[midi]) return;
      const { isAccidental } = MidiNumbers.getAttributes(midi);
      const leftPosition =
        getRelativeKeyPosition(midi, this.range) * naturalKeyWidth * _width;

      const width =
        (isAccidental ? 0.65 * naturalKeyWidth : naturalKeyWidth) * _width;

      for (let i = 0; i < _groupedNotes[midi].length; i++) {
        const note = _groupedNotes[midi][i];
        const top = (note.time / track.duration) * trackHeight + offset;
        const height = (note.duration / track.duration) * trackHeight;

        if (top + height < offset) {
          continue;
        }

        if (top > _height) {
          break;
        }

        this.ctx.beginPath();

        const dimensions = [
          leftPosition + RADIUS / 2 + HORIZONTAL_MARGIN / 2,
          top + RADIUS / 2,
          width - RADIUS - HORIZONTAL_MARGIN,
          height - RADIUS
        ].map(num => Math.floor(num));

        // Set faux rounded corners
        this.ctx.lineJoin = "round";
        this.ctx.lineWidth = RADIUS;
        this.ctx.fillStyle = isAccidental ? "#ffdc66" : "#42C9FF";
        this.ctx.strokeStyle = isAccidental ? "#ffdc66" : "#42C9FF";

        // Change origin and dimensions to match true size (a stroke makes the shape a bit larger)
        // @ts-ignore
        this.ctx.strokeRect(...dimensions);
        // @ts-ignore
        this.ctx.fillRect(...dimensions);
        this.ctx.closePath();
      }
    });
  };

  setRange = (range: Range) => {
    this.range = range;
  };
}
