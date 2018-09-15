import { MidiNumbers } from "react-piano";
import { groupBy } from "lodash";
import { Note, Track } from "midiconvert";
import {
  getAllMidiNumbersInRange,
  getNaturalKeyWidthRatio,
  getRelativeKeyPosition
} from "@utils/keyboard";
import { Dimensions, Range } from "@utils/typings/Visualizer";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";

const SPEED = 250;
const RADIUS = 5;
const HORIZONTAL_MARGIN = 2;
const CORRECTION = SPEED;

export class Visualizer {
  ctx: CanvasRenderingContext2D;
  range: Range;
  mode: VISUALIZER_MODE;
  intervalId: number;
  notes: Partial<Note>[];
  writeIntervalId: number;
  referenceTime: number;

  constructor(canvas, dimensions, range, mode = VISUALIZER_MODE.WRITE) {
    this.ctx = canvas.getContext("2d");
    this.range = range;
    this.notes = [];
    this.setDimensions(dimensions);
    this.setMode(mode);
  }

  public setDimensions = ({ width, height }: Dimensions) => {
    this.ctx.canvas.width = width;
    this.ctx.canvas.height = height;
  };

  private createNoteBlock = (
    x: number,
    y: number,
    width: number,
    height: number,
    isAccidental: boolean
  ) => {
    this.ctx.beginPath();

    const dimensions = [
      x + RADIUS / 2 + HORIZONTAL_MARGIN / 2,
      y + RADIUS / 2,
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
  };

  private getTrackInfo = (track?: Track) => {
    const notes =
      this.mode === VISUALIZER_MODE.WRITE ? this.notes : track && track.notes;
    const midiNumbers = getAllMidiNumbersInRange(this.range);
    const groupedNotes = groupBy(notes, "midi");

    return {
      groupedNotes,
      midiNumbers
    };
  };

  private getMidiInfo = midi => {
    const { isAccidental } = MidiNumbers.getAttributes(midi);
    const _width = this.ctx.canvas.width;
    const naturalKeyWidth = getNaturalKeyWidthRatio(this.range) * _width;
    const left = getRelativeKeyPosition(midi, this.range) * naturalKeyWidth;

    const width = isAccidental ? 0.65 * naturalKeyWidth : naturalKeyWidth;

    return { left, width, isAccidental };
  };

  private renderNotesInWriteMode = () => {
    this.clearCanvas();
    const timeElapsed = Date.now() / 1000 - this.referenceTime;

    const { midiNumbers, groupedNotes } = this.getTrackInfo();

    const canvasHeight = this.ctx.canvas.height;

    midiNumbers.forEach(midi => {
      if (!groupedNotes[midi]) return;
      const { isAccidental, left, width } = this.getMidiInfo(midi);

      for (let i = 0; i < groupedNotes[midi].length; i++) {
        const note = groupedNotes[midi][i];
        const top =
          (note.time - timeElapsed) * SPEED + canvasHeight - CORRECTION;
        const height =
          (note.duration || Number.MAX_SAFE_INTEGER / SPEED) * SPEED;

        if (top + height < 0) {
          //TODO: fix this
          this.notes.shift();
          continue;
        }

        this.createNoteBlock(left, top, width, height, isAccidental);
      }
    });
  };

  public setMode = (mode: VISUALIZER_MODE) => {
    this.mode = mode;
    this.clearCanvas();
    if (mode === VISUALIZER_MODE.WRITE) {
      this.referenceTime = Date.now() / 1000;
      this.stop();
      this.writeIntervalId = self.setInterval(() => {
        this.renderNotesInWriteMode();
      }, 4);
    } else {
      this.writeIntervalId && clearInterval(this.writeIntervalId);
    }
  };

  public play = (track: Track) => {
    let offset = 0;
    this.intervalId = self.setInterval(() => {
      this.renderNotesInReadMode(track, offset);
      offset -= 1;
    }, 4);
  };

  public addNote = midi => {
    this.notes.push({
      midi,
      time: Date.now() / 1000 - this.referenceTime
    });
  };

  public endNote = midi => {
    const note = this.notes.find(note => note.midi === midi && !note.duration);
    note.duration = Date.now() / 1000 - (this.referenceTime + note.time);
  };

  public stop = () => {
    clearInterval(this.intervalId);
    this.clearCanvas();
  };

  private clearCanvas = () =>
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

  private renderNotesInReadMode = (track: Track, offset: number) => {
    this.clearCanvas();

    const { midiNumbers, groupedNotes } = this.getTrackInfo(track);

    const canvasHeight = this.ctx.canvas.height;

    midiNumbers.forEach(midi => {
      if (!groupedNotes[midi]) return;
      const { isAccidental, left, width } = this.getMidiInfo(midi);

      for (let i = 0; i < groupedNotes[midi].length; i++) {
        const note = groupedNotes[midi][i];
        const top = note.time * SPEED + offset;
        const height = note.duration * SPEED;

        if (top + height < offset) {
          continue;
        }

        if (top > canvasHeight) {
          break;
        }

        this.createNoteBlock(left, top, width, height, isAccidental);
      }
    });
  };

  setRange = (range: Range) => {
    this.range = range;
  };
}
