import React, { FunctionComponent, memo, useState } from "react";
import cn from "@sindresorhus/class-names";
import { Button } from "@components/Button";
import { MidiNumbers } from "piano-utils";
import { RANGE_PRESETS } from "@config/piano";
import { Range } from "@utils/typings/Visualizer";
import { Dropdown } from "@components/Dropdown";
import { getTrackBackground, Range as RangeSlider } from "react-range";
import { mdiMinus } from "@mdi/js";
import Icon from "@mdi/react";

interface PianoRangeSelectorProps {
  range: Range;
  onRangeChange: (range: number[]) => void;
}

const naturalKeys = MidiNumbers.NATURAL_MIDI_NUMBERS.map(midi => {
  const { note } = MidiNumbers.getAttributes(midi);
  return {
    label: note,
    value: midi
  };
});

const indexOfMidiNumber = (midiNumber: number): number =>
  naturalKeys.findIndex(({ value }) => value === midiNumber);

const _PianoRangeSelector: FunctionComponent<PianoRangeSelectorProps> = ({
  range,
  onRangeChange
}) => {
  const [_range, _setRange] = useState([
    indexOfMidiNumber(range.first),
    indexOfMidiNumber(range.last)
  ]);

  const setRange = (range_: number[]) => {
    onRangeChange([naturalKeys[range_[0]].value, naturalKeys[range_[1]].value]);
    _setRange(range_);
  };

  return (
    <div className="header-range-wrapper">
      <div className="text-gray-500 text-xs mr-4">Range</div>
      <Dropdown
        label={() => (
          <Button className="h-6">
            <>
              {MidiNumbers.getAttributes(range.first).note}
              <Icon path={mdiMinus} color="#fff" size={0.5} className="mx-2" />
              {MidiNumbers.getAttributes(range.last).note}
            </>
          </Button>
        )}
      >
        {() => (
          <div className="prs-content">
            <div className="py-1">
              <div className="text-sm text-white mb-1">Presets</div>
              <div className="flex">
                {RANGE_PRESETS.map(({ first, last }) => {
                  const [presetMin, presetMax] = [
                    indexOfMidiNumber(first),
                    indexOfMidiNumber(last)
                  ];
                  return (
                    <div
                      className={cn("keyboard-layout-list mx-1", {
                        selected:
                          presetMin === _range[0] && presetMax === _range[1]
                      })}
                      key={`${first}-${last}`}
                      onClick={() => {
                        setRange([presetMin, presetMax]);
                      }}
                    >
                      <div className="flex items-center">
                        {MidiNumbers.getAttributes(first).note}
                        <Icon
                          name="minus"
                          color="#fff"
                          size={8}
                          className="mx-1"
                        />
                        {MidiNumbers.getAttributes(last).note}
                      </div>
                      <div className="text-center">{last - first + 1} keys</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="py-2">
              <div className="text-sm text-white mb-1">Custom</div>
              <div>
                <RangeSlider
                  step={1}
                  min={0}
                  max={naturalKeys.length - 1}
                  values={_range}
                  onChange={setRange}
                  renderTrack={({ props, children }) => (
                    <div
                      onMouseDown={props.onMouseDown as any}
                      onTouchStart={props.onTouchStart}
                      className="h-10 flex w-full"
                      style={props.style}
                    >
                      <div
                        ref={props.ref}
                        className="h-1 w-full self-center rounded"
                        style={{
                          background: getTrackBackground({
                            values: _range,
                            colors: ["#ccc", "#2196f3", "#ccc"],
                            min: 0,
                            max: naturalKeys.length - 1
                          })
                        }}
                      >
                        {children}
                      </div>
                    </div>
                  )}
                  renderThumb={({ index, props }) => (
                    <div {...props} style={props.style}>
                      <div className="prs-thumb" />
                      <span className="prs-label">
                        {naturalKeys[_range[index]].label}
                      </span>
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        )}
      </Dropdown>
    </div>
  );
};

export const PianoRangeSelector = memo(_PianoRangeSelector);
