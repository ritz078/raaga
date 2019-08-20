import * as React from "react";
import {
  getAllMidiNumbersInRange,
  getNaturalKeyWidthRatio,
  getRelativeKeyPosition
} from "@utils";
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
  css?: {};
}

const _Piano: FunctionComponent<PianoProps> = ({
  activeMidis,
  onPlay,
  onStop,
  max,
  min,
  css
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
    <div css={{ ...piano, ...css }}>
      {midis.map(midi => {
        const { isAccidental } = MidiNumbers.getAttributes(midi);
        const naturalKeyWidth = getNaturalKeyWidthRatio(range) * 100;
        const left = getRelativeKeyPosition(midi, range) * naturalKeyWidth;

        const width = isAccidental ? 0.65 * naturalKeyWidth : naturalKeyWidth;
        const base = {
          left: `${left}%`,
          width: `${width}%`
        };

        const _css = {
          ...base,
          ...keys,
          ...(isAccidental ? accidentalKeys : naturalKeys)
        };

        return (
          <div
            data-id={midi}
            onMouseDown={() => onMouseDown(midi)}
            onMouseUp={() => onMouseUp(midi)}
            onMouseEnter={isMousePressed ? () => play(midi) : undefined}
            onMouseLeave={() => stop(midi)}
            className={
              activeMidis.indexOf(midi) >= 0 ? "__active__" : undefined
            }
            css={_css}
            key={midi}
          >
            {!isAccidental && (
              <div css={labelStyle}>
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
