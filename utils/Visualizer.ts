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

function now() {
  return Date.now() / 1000;
}

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

  /**
   * Sets the dimension of the canvas.
   * @param width
   * @param height
   */
  public setDimensions = ({ width, height }: Dimensions) => {
    this.ctx.canvas.width = width;
    this.ctx.canvas.height = height;
    if (this.mode === VISUALIZER_MODE.WRITE) {
      this.startWriteMode();
    }
  };

  /**
   * Creates a single note block on canvas. The color varies based on whether it's
   * an accidental note or natural note.
   * @param x
   * @param y
   * @param width
   * @param height
   * @param isAccidental
   */
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

    const color = isAccidental ? "#ffdc66" : "#42C9FF";

    this.ctx.lineJoin = "round";
    this.ctx.lineWidth = RADIUS;
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;

    // Change origin and dimensions to match true size (a stroke makes the shape a bit larger)
    // @ts-ignore
    this.ctx.strokeRect(...dimensions);
    // @ts-ignore
    this.ctx.fillRect(...dimensions);
    this.ctx.closePath();
  };

  /**
   * Utility that returns all the midis that fall within the piano range and groups them
   * by key
   * @param track
   */
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

  /**
   * utility that returns info about a midi number.
   * @param midi
   */
  private getMidiInfo = midi => {
    const { isAccidental } = MidiNumbers.getAttributes(midi);
    const _width = this.ctx.canvas.width;
    const naturalKeyWidth = getNaturalKeyWidthRatio(this.range) * _width;
    const left = getRelativeKeyPosition(midi, this.range) * naturalKeyWidth;

    const width = isAccidental ? 0.65 * naturalKeyWidth : naturalKeyWidth;

    return { left, width, isAccidental };
  };

  /**
   * The main renderer that renders notes on the canvas in the WRITE mode.
   * WRITE mode refers to the mode when the user is controlling the piano my
   * manually providing input either from real midi device or the on screen
   * piano
   */
  private renderNotesInWriteMode = () => {
    this.clearCanvas();
    const { midiNumbers, groupedNotes } = this.getTrackInfo();

    const canvasHeight = this.ctx.canvas.height;

    midiNumbers.forEach(midi => {
      if (!groupedNotes[midi]) return;
      const { isAccidental, left, width } = this.getMidiInfo(midi);

      for (let i = 0; i < groupedNotes[midi].length; i++) {
        const note = groupedNotes[midi][i];
        const top = (note.time - now()) * SPEED + canvasHeight;
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

  private cleanup = () => {
    this.clearCanvas();
    this.intervalId && clearInterval(this.intervalId);
    this.writeIntervalId && clearInterval(this.writeIntervalId);
  };

  private startWriteMode = () => {
    this.cleanup();
    this.referenceTime = now();
    this.writeIntervalId = self.setInterval(() => {
      this.renderNotesInWriteMode();
    }, 4);
  };

  public setMode = (mode: VISUALIZER_MODE) => {
    this.mode = mode;
    this.cleanup();
    if (mode === VISUALIZER_MODE.WRITE) {
      this.startWriteMode();
    }
  };

  public play = (track: Track) => {
    this.cleanup();
    this.referenceTime = now();
    this.intervalId = self.setInterval(() => {
      this.renderNotesInReadMode(track);
    }, 5);
  };

  public addNote = midi => {
    this.notes.push({
      midi,
      time: now()
    });
  };

  public endNote = midi => {
    const note = this.notes.find(note => note.midi === midi && !note.duration);
    note.duration = now() - note.time;
  };

  private clearCanvas = () =>
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

  private renderNotesInReadMode = (track: Track) => {
    this.clearCanvas();

    const { midiNumbers, groupedNotes } = this.getTrackInfo(track);

    const canvasHeight = this.ctx.canvas.height;

    midiNumbers.forEach(midi => {
      if (!groupedNotes[midi]) return;
      const { isAccidental, left, width } = this.getMidiInfo(midi);

      for (let i = 0; i < groupedNotes[midi].length; i++) {
        const note = groupedNotes[midi][i];
        const top = (note.time - (now() - this.referenceTime)) * SPEED;
        const height = note.duration * SPEED;

        // These are past notes which have been shown.
        if (top + height < 0) {
          continue;
        }

        // This is assuming that the notes in the midi are sorted by their time
        // in increasing order. In case one note is out of bound, all the following
        // will be. We skip all the future notes.
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
