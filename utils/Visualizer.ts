import { MidiNumbers } from "piano-utils";
import { groupBy, memoize } from "lodash";
import {
  getAllMidiNumbersInRange,
  getNaturalKeyWidthRatio,
  getRelativeKeyPosition
} from "@utils/keyboard";
import { Dimensions, Range } from "@utils/typings/Visualizer";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import { Clock } from "@utils/Clock";
import {
  HORIZONTAL_GAP_BETWEEN_NOTES,
  MS_PER_SECOND,
  WATERFALL_VISUALIZER_SCALE,
  RADIUS, WATERFALL_VISUALIZER_OVERSCAN_BUFFER
} from "@config/piano";
import { Theme } from "@utils/typings/Theme";
import { INote, ITrackSequence } from "@utils/Midi/Midi";

function nowInSeconds() {
  return performance.now() / 1000;
}

export class Visualizer {
  ctx: CanvasRenderingContext2D;
  range: Range;
  mode: VISUALIZER_MODE;
  notes: INote[];
  writeIntervalId: number;
  clock = new Clock(MS_PER_SECOND);
  theme: Theme;

  constructor({
    canvas,
    dimensions,
    range,
    mode = VISUALIZER_MODE.WRITE,
    theme
  }: {
    canvas;
    dimensions: Dimensions;
    range: Range;
    mode: VISUALIZER_MODE;
    theme: Theme;
  }) {
    this.ctx = canvas.getContext("2d");
    this.range = range;
    this.notes = [];
    this.setDimensions(dimensions);
    this.setMode(mode);
    this.theme = theme;
  }

  public setSpeed = (speed: number) => {
    this.clock.setSpeed(speed);
  };

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
   * Sets the theme
   * @param theme
   */
  public setTheme = (theme: Theme) => {
    this.theme = theme;
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
      x + RADIUS / 2 + HORIZONTAL_GAP_BETWEEN_NOTES / 2,
      y + RADIUS / 2,
      width - RADIUS - HORIZONTAL_GAP_BETWEEN_NOTES,
      height - RADIUS
    ];

    const color = isAccidental
      ? this.theme.accidentalColor
      : this.theme.naturalColor;

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
  private getTrackInfo = (track?: ITrackSequence) => {
    const notes =
      this.mode === VISUALIZER_MODE.WRITE ? this.notes : track?.notes;
    const midiNumbers = getAllMidiNumbersInRange(this.range);
    const groupedNotes = groupBy(notes, "pitch");

    return {
      groupedNotes,
      midiNumbers
    };
  };

  /**
   * utility that returns info about a midi number.
   * @param midi
   */
  private getMidiInfo = (midi: number) => {
    const { isAccidental } = MidiNumbers.getAttributes(midi);
    const _width = this.ctx.canvas.width;
    const naturalKeyWidth = getNaturalKeyWidthRatio(this.range) * _width;
    const left = getRelativeKeyPosition(midi, this.range) * naturalKeyWidth;

    const width = isAccidental ? 0.65 * naturalKeyWidth : naturalKeyWidth;

    return { left, width, isAccidental };
  };

  private memoizedGetMidiInfo = memoize(this.getMidiInfo)

  private getVerticalCoordinatesInWriteMode = (
    note: INote
  ): {
    top: number;
    height: number;
  } => {
    const canvasHeight = this.ctx.canvas.height;
    const duration = note.endTime - note.startTime;

    const top =
      (note.startTime - nowInSeconds()) * WATERFALL_VISUALIZER_SCALE + canvasHeight;
    const height =
      (duration || Number.MAX_SAFE_INTEGER / WATERFALL_VISUALIZER_SCALE) *
      WATERFALL_VISUALIZER_SCALE;

    return {
      top,
      height
    };
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

    midiNumbers.forEach(midi => {
      if (!groupedNotes[midi]) return;
      const { isAccidental, left, width } = this.memoizedGetMidiInfo(midi);

      for (let i = 0; i < groupedNotes[midi].length; i++) {
        const note = groupedNotes[midi][i];
        const { top, height } = this.getVerticalCoordinatesInWriteMode(note);

        if (top + height < 0) {
          this.notes = this.notes.filter(_note => {
            const { top, height } = this.getVerticalCoordinatesInWriteMode(
              _note
            );
            return top + height >= 0;
          });
          continue;
        }

        this.createNoteBlock(left, top, width, height, isAccidental);
      }
    });
  };

  private cleanup = () => {
    this.clock.stop();
    this.clearCanvas();
    this.setSpeed(1);
    this.writeIntervalId && clearInterval(this.writeIntervalId);
  };

  private startWriteMode = () => {
    this.cleanup();
    this.writeIntervalId = self.setInterval(() => {
      if (this.notes.length) this.renderNotesInWriteMode();
    }, MS_PER_SECOND);
  };

  public setMode = (mode: VISUALIZER_MODE) => {
    this.mode = mode;
    this.cleanup();
    if (mode === VISUALIZER_MODE.WRITE) {
      this.startWriteMode();
    }
  };

  public play = (track: ITrackSequence, delay = 0) => {
    this.cleanup();
    this.clock.start(track.totalTime + delay, progress => {
      this.renderNotesInReadMode(track, progress, delay);
    });
  };

  public toggle = () => {
    if (this.mode === VISUALIZER_MODE.WRITE) {
      console.warn(`toggle() method only works in Read mode.`);
      return;
    }
    this.clock.toggle();
  };

  public addNote = pitch => {
    this.notes.push({
      pitch,
      startTime: nowInSeconds()
    });
  };

  public endNote = midi => {
    const note = this.notes.find(note => {
      const duration = note.endTime - note.startTime;
      return note.pitch === midi && !duration;
    });
    note.endTime = nowInSeconds();
  };

  private clearCanvas = () =>
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

  private renderNotesInReadMode = (
    track: ITrackSequence,
    progress: number,
    delay = 0
  ) => {
    this.clearCanvas();

    const timeElapsed = (track.totalTime + delay) * progress;

    const { midiNumbers, groupedNotes } = this.getTrackInfo(track);

    const canvasHeight = this.ctx.canvas.height;

    midiNumbers.forEach(midi => {
      if (!groupedNotes[midi]) return;
      const { isAccidental, left, width } = this.memoizedGetMidiInfo(midi);

      for (let i = 0; i < groupedNotes[midi].length; i++) {
        const note = groupedNotes[midi][i];
        const duration = note.endTime - note.startTime;
        const top =
          (note.startTime + delay - timeElapsed) * WATERFALL_VISUALIZER_SCALE;
        const height = duration * WATERFALL_VISUALIZER_SCALE;

        // These are past notes which have been shown.
        if (top + height < -WATERFALL_VISUALIZER_OVERSCAN_BUFFER) {
          continue;
        }

        // This is assuming that the notes in the midi are sorted by their time
        // in increasing order. In case one note is out of bound, all the following
        // will be. We skip all the future notes.
        if (top > canvasHeight + WATERFALL_VISUALIZER_OVERSCAN_BUFFER) {
          break;
        }

        this.createNoteBlock(left, top, width, height, isAccidental);
      }
    });
  };

  setRange = (range: Range) => {
    this.memoizedGetMidiInfo.cache.clear();
    this.range = range;
  };
}
