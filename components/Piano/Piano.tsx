import * as React from "react";
import {
  getAllMidiNumbersInRange,
  getNaturalKeyWidthRatio,
  getRelativeKeyPosition
} from "@utils";
import { MidiNumbers } from "piano-utils";
import Tone from "tone";
import { FunctionComponent, useState } from "react";
import cn from "@sindresorhus/class-names";

interface PianoProps {
  min: number;
  max: number;
  onPlay: (midi: number) => void;
  onStop: (midi: number) => void;
  activeMidis: number[];
  className: string;
  activeInstrumentMidis: number[];
}

const _Piano: FunctionComponent<PianoProps> = ({
  activeMidis,
  onPlay,
  onStop,
  max,
  min,
  className,
  activeInstrumentMidis
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
    <div
      className={cn(
        "flex justify-center w-full relative overflow-x-hidden",
        className
      )}
    >
      {midis.map(midi => {
        const { isAccidental } = MidiNumbers.getAttributes(midi);
        const naturalKeyWidth = getNaturalKeyWidthRatio(range) * 100;
        const left = getRelativeKeyPosition(midi, range) * naturalKeyWidth;

        const width = isAccidental ? 0.65 * naturalKeyWidth : naturalKeyWidth;
        const style = {
          left: `${left}%`,
          width: `${width}%`
        };

        const className = cn({
          "accidental-keys": isAccidental,
          "natural-keys": !isAccidental,
          __active__: activeMidis.includes(midi),
          bingo:
            activeInstrumentMidis.includes(midi) && activeMidis.includes(midi),
          "not-this":
            activeInstrumentMidis.includes(midi) && !activeMidis.includes(midi)
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
            style={style}
          >
            {!isAccidental && (
              <div className="uppercase flex justify-center self-end w-full pb-4 select-none text-sm text-gray-700">
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
