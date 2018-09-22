import * as React from "react";
import {
  getAllMidiNumbersInRange,
  getNaturalKeyWidthRatio,
  getRelativeKeyPosition
} from "@utils";
import { css, cx } from "emotion";
import {
  accidentalKeys,
  keys,
  labelStyle,
  naturalKeys
} from "@components/styles/Piano.styles";
import { MidiNumbers } from "react-piano";
import { piano } from "@components/styles/SoundPlayer.styles";
import Tone from "tone";

interface PianoProps {
  min: number;
  max: number;
  onPlay: (midi: number) => void;
  onStop: (midi: number) => void;
  activeMidis: number[];
  className?: string;
}

export class Piano extends React.PureComponent<PianoProps> {
  state = {
    isMousePressed: false
  };

  play = (midi: number) => {
    if (this.props.activeMidis.includes(midi)) return;
    this.props.onPlay(midi);
  };

  stop = (midi: number) => {
    const isInactive = !this.props.activeMidis.includes(midi);
    if (isInactive) {
      return;
    }
    this.props.onStop(midi);
  };

  onMouseDown = (midi: number) => {
    this.setState(
      {
        isMousePressed: true
      },
      () => this.play(midi)
    );
  };

  onMouseUp = (midi: number) => {
    this.setState(
      {
        isMousePressed: false
      },
      () => this.stop(midi)
    );
  };

  render() {
    const { activeMidis, min, max, className } = this.props;
    const range = { first: min, last: max };
    const midis = getAllMidiNumbersInRange(range);

    return (
      <div className={cx(piano, className)}>
        {midis.map(midi => {
          const { isAccidental } = MidiNumbers.getAttributes(midi);
          const naturalKeyWidth = getNaturalKeyWidthRatio(range) * 100;
          const left = getRelativeKeyPosition(midi, range) * naturalKeyWidth;

          const width = isAccidental ? 0.65 * naturalKeyWidth : naturalKeyWidth;
          const base = css({
            left: `${left}%`,
            width: `${width}%`
          });

          const className = cx(base, keys, {
            [accidentalKeys]: isAccidental,
            [naturalKeys]: !isAccidental,
            __active__: activeMidis.indexOf(midi) >= 0
          });
          return (
            <div
              data-id={midi}
              onMouseDown={() => this.onMouseDown(midi)}
              onMouseUp={() => this.onMouseUp(midi)}
              onMouseEnter={
                this.state.isMousePressed ? () => this.play(midi) : undefined
              }
              onMouseLeave={() => this.stop(midi)}
              className={className}
              key={midi}
            >
              <div className={labelStyle}>
                {Tone.Frequency(midi, "midi").toNote()}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
