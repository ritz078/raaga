import { groupBy, range } from "lodash";
import { MidiNumbers } from "react-piano";
import { VISUALIZER_MESSAGES } from "@enums/visulaizerMessages";
import { Track } from "midiconvert";

const SPEED = 1000;

const pitchPositions = {
  C: 0,
  Db: 0.55,
  D: 1,
  Eb: 1.8,
  E: 2,
  F: 3,
  Gb: 3.5,
  G: 4,
  Ab: 4.7,
  A: 5,
  Bb: 5.85,
  B: 6
};

interface Range {
  first: number;
  last: number;
}

interface Dimensions {
  width: number;
  height: number;
}

function getAllMidiNumbers(_range: Range): number[] {
  return range(_range.first, _range.last + 1);
}

function getNaturalKeysCount(midis: number[]): number {
  return midis.filter(number => {
    const { isAccidental } = MidiNumbers.getAttributes(number);
    return !isAccidental;
  }).length;
}

function getNaturalKeyWidth(midis: number[]): number {
  return 1 / getNaturalKeysCount(midis);
}

function getRelativeKeyPosition(midiNumber, range) {
  return (
    getAbsoluteKeyPosition(midiNumber) - getAbsoluteKeyPosition(range.first)
  );
}

function getAbsoluteKeyPosition(midiNumber: number): number {
  const OCTAVE_WIDTH = 7;
  const { octave, pitchName } = MidiNumbers.getAttributes(midiNumber);
  const pitchPosition = pitchPositions[pitchName];
  const octavePosition = OCTAVE_WIDTH * octave;
  return pitchPosition + octavePosition;
}

class Visualizer {
  ctx: CanvasRenderingContext2D;
  range: Range;

  constructor(canvas, dimensions, range) {
    this.ctx = canvas.getContext("2d");
    this.range = range;
    this.setDimensions(dimensions);
  }

  setDimensions = ({ width, height }) => {
    this.ctx.canvas.width = width;
    this.ctx.canvas.height = height;
  };

  clearCanvas = () =>
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

  createNoteBlock = (track, offset) => {
    this.clearCanvas();

    const _midiNumbers = getAllMidiNumbers(this.range);
    const _groupedNotes = groupBy(track && track.notes, "midi");

    const trackHeight = track.duration * SPEED;

    const _width = this.ctx.canvas.width;
    const _height = this.ctx.canvas.height;

    const naturalKeyWidth = getNaturalKeyWidth(_midiNumbers);

    _midiNumbers.forEach(midi => {
      if (!_groupedNotes[midi]) return;
      const isAccidental = MidiNumbers.getAttributes(midi).isAccidental;
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
        this.ctx.fillStyle = isAccidental ? "#ffdc66" : "#42C9FF";
        this.ctx.rect(
          Math.floor(leftPosition),
          Math.floor(top),
          Math.floor(width),
          Math.floor(height)
        );
        this.ctx.fill();
        this.ctx.closePath();
      }
    });
  };

  setRange = (range: Range) => {
    this.range = range;
  };
}

let visualizer, intervalId;

interface Data {
  canvas: {
    getContext: (x: string) => CanvasRenderingContext2D;
  };
  track: Track;
  message: VISUALIZER_MESSAGES;
  range: Range;
  dimensions: Dimensions;
}

self.onmessage = e => {
  const { canvas, track, message, range, dimensions }: Data = e.data;

  if (message === VISUALIZER_MESSAGES.INIT) {
    clearInterval(intervalId);
    visualizer = new Visualizer(canvas, dimensions, range);
  } else if (message === VISUALIZER_MESSAGES.UPDATE_DIMENSIONS) {
    visualizer.setDimensions(dimensions);
  } else if (message === VISUALIZER_MESSAGES.UPDATE_RANGE) {
    visualizer.setRange(range);
  } else if (message === VISUALIZER_MESSAGES.PLAY) {
    let offset = 0;
    visualizer.setRange(range);
    clearInterval(intervalId);
    intervalId = self.setInterval(() => {
      visualizer.createNoteBlock(track, offset);
      offset -= 4;
    }, 4);
  }
};
