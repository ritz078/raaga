import { groupBy, range } from "lodash";
import { MidiNumbers } from "react-piano";

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

function getAllMidiNumbers(_range) {
  return range(_range.first, _range.last + 1);
}

function getNaturalKeysCount(midis) {
  return midis.filter(number => {
    const { isAccidental } = MidiNumbers.getAttributes(number);
    return !isAccidental;
  }).length;
}

function getNaturalKeyWidth(midis) {
  return 1 / getNaturalKeysCount(midis);
}

function getAbsoluteKeyPosition(midiNumber) {
  const OCTAVE_WIDTH = 7;
  const { octave, pitchName } = MidiNumbers.getAttributes(midiNumber);
  const pitchPosition = pitchPositions[pitchName];
  const octavePosition = OCTAVE_WIDTH * octave;
  return pitchPosition + octavePosition;
}

function getRelativeKeyPosition(midiNumber, range) {
  return (
    getAbsoluteKeyPosition(midiNumber) - getAbsoluteKeyPosition(range.first)
  );
}

function Bar(ctx, dimensions, range) {
  this.ctx = ctx.getContext("2d");
  this.range = range;
  this.setDimensions(dimensions);
}

Bar.prototype.clearCanvas = function() {
  this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
};

Bar.prototype.setDimensions = function({ width, height }) {
  this.ctx.canvas.width = width;
	this.ctx.canvas.height = height;
};

Bar.prototype.setRange = function(range) {
	this.range = range;
};

Bar.prototype.createNoteBlock = function(track, offset) {
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

let bar, intervalId;

self.onmessage = e => {
  const { canvas, track, message, range, dimensions } = e.data;

  if (message === "init") {
    clearInterval(intervalId);
    bar = new Bar(canvas, dimensions, range);
  } else if (message === "updateDimensions") {
    bar.setDimensions(dimensions)
  } else if (message === "updateRange") {
		bar.setRange(range)
	} else {
    let offset = 0;
		bar.setRange(range);
		clearInterval(intervalId);
    intervalId = self.setInterval(() => {
      bar.createNoteBlock(track, offset);
      offset -= 4;
    }, 4);
  }
};
