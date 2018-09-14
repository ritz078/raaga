import { groupBy, range } from "lodash";
import { MidiNumbers } from "react-piano";

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

function Bar(ctx) {
  this.ctx = ctx.getContext("2d");
}

let rectCoords = [];

Bar.prototype.clearRectangles = function() {
  rectCoords.forEach(coord => this.ctx.clearRect(...coord));
  rectCoords = [];
};

Bar.prototype.createNoteBlock = function(track, range, offset) {
  this.clearRectangles();

  const _midiNumbers = getAllMidiNumbers(range);
  const _groupedNotes = groupBy(track && track.notes, "midi");

  const _height = 638 * 500;
  const _width = 1620;

  const naturalKeyWidth = getNaturalKeyWidth(_midiNumbers);

  _midiNumbers.forEach(midi => {
    if (!_groupedNotes[midi]) return;
    const isAccidental = MidiNumbers.getAttributes(midi).isAccidental;
    const leftPosition = getRelativeKeyPosition(midi, range) * naturalKeyWidth * _width
    const width =
      (isAccidental ? 0.65 * naturalKeyWidth : naturalKeyWidth) * _width;

    for (let i = 0; i < _groupedNotes[midi].length; i++) {
      const note = _groupedNotes[midi][i];
      const top = (note.time / 638) * _height + offset;
      const height = (note.duration / 638) * _height;

      if (top + height < offset) {
      	continue;
			}

      if (top > 400) {
        break;
      }

      const _rectCoords = [Math.floor(leftPosition), Math.floor(top), Math.floor(width), Math.floor(height)];
      rectCoords.push(_rectCoords);

      this.ctx.beginPath();
			this.ctx.fillStyle = isAccidental ? "#28E6FF" : "#42C9FF";
      this.ctx.rect(..._rectCoords);
      this.ctx.fill();
      this.ctx.closePath();
    }
  });
};

let bar;

self.onmessage = e => {
  const { canvas, track, message, range } = e.data;

  if (message === "init") {
    bar = new Bar(canvas);
  } else {
    let offset = 0;
    self.setInterval(() => {
      bar.createNoteBlock(track, range, offset);
      offset -= 1;
    }, 0);
  }
};
