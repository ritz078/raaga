import React, { FunctionComponent, memo, useState } from "react";
import { Button } from "@components/Button";
import { MidiNumbers } from "piano-utils";
import { Icon } from "@components/Icon";
import { Range } from "@utils/typings/Visualizer";
import { Dropdown } from "@components/Dropdown";
import { getTrackBackground, Range as RangeSlider } from "react-range";

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

const _PianoRangeSelector: FunctionComponent<PianoRangeSelectorProps> = ({
  range,
  onRangeChange
}) => {
  const min = naturalKeys.findIndex(key => key.value === range.first);
  const max = naturalKeys.findIndex(key => key.value === range.last);
  const [_range, _setRange] = useState([min, max]);

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
              <Icon name="minus" color="#fff" size={8} className="mx-2" />
              {MidiNumbers.getAttributes(range.last).note}
            </>
          </Button>
        )}
      >
        {() => (
          <div className="prs-content">
            <div className="text-sm text-white mb-2">Piano Range Selector</div>

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
        )}
      </Dropdown>
    </div>
  );
};

export const PianoRangeSelector = memo(_PianoRangeSelector);
