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
import { MidiNumbers } from "piano-utils";
import { piano } from "@components/styles/SoundPlayer.styles";
import Tone from "tone";
import { FunctionComponent, useState } from "react";

interface PianoProps {
  min: number;
  max: number;
  onPlay: (midi: number) => void;
  onStop: (midi: number) => void;
  activeMidis: number[];
  className?: string;
}

const _Piano: FunctionComponent<PianoProps> = ({
  activeMidis,
  onPlay,
  onStop,
  max,
  min,
  className
}) => {
  const [isMousePressed, setMousePressed] = useState(false);

  const play = (midi: number) => {
    if (activeMidis.includes(midi)) return;
    onPlay(midi);
  };

  const stop = (midi: number) => {
    const isInactive = !activeMidis.includes(midi);
    if (isInactive) {
      return;
    }
    onStop(midi);
  };

  const onMouseDown = (midi: number) => {
    setMousePressed(true);
    play(midi);
  };

  const onMouseUp = (midi: number) => {
    setMousePressed(false);
    stop(midi);
  };

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
            onMouseDown={() => onMouseDown(midi)}
            onMouseUp={() => onMouseUp(midi)}
            onMouseEnter={isMousePressed ? () => play(midi) : undefined}
            onMouseLeave={() => stop(midi)}
            className={className}
            key={midi}
          >
            {!isAccidental && (
              <div className={labelStyle}>
                {Tone.Frequency(midi, "midi").toNote()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const Piano = React.memo(_Piano);
