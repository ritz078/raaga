import React, { memo, useRef, useState } from "react";
import { PianoRangeSelector } from "@components/PianoRangeSelector";
import { Dropdown } from "@components/Dropdown";
import { Button } from "@components/Button";
import { getInstrumentByValue, instruments } from "midi-instruments";
import cn from "@sindresorhus/class-names";
import FuzzySearch from "fuzzy-search";
import { Range } from "@utils/typings/Visualizer";
import Icon from "@mdi/react";
import { mdiMenuSwap } from "@mdi/js";

interface WriteModeControlsProps {
  onRangeChange: (range: number[]) => void;
  instrument: string;
  onInstrumentChange: (instrument: React.ReactText) => void;
  range: Range;
}

const instrumentOptions = Object.keys(instruments).map(id => {
  const { name, value } = instruments[id];
  return {
    label: name,
    value
  };
});

const _WriteModeControls: React.FunctionComponent<WriteModeControlsProps> = ({
  range,
  onRangeChange,
  instrument,
  onInstrumentChange
}) => {
  const fuzzySearch = useRef(new FuzzySearch(instrumentOptions, ["label"]));
  const [instrumentList, setInstrumentList] = useState(instrumentOptions);

  const onSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    setInstrumentList(fuzzySearch.current.search(e.currentTarget.value));
  };

  return (
    <>
      <div className="mr-4">
        <PianoRangeSelector range={range} onRangeChange={onRangeChange} />
      </div>

      <Dropdown
        contentClassName={"instrument-selector"}
        label={() => (
          <Button className="h-8">
            <>
              {getInstrumentByValue(instrument).name}{" "}
              <Icon path={mdiMenuSwap} color="#fff" size={0.8} />
            </>
          </Button>
        )}
      >
        {close => (
          <div className="py-2" style={{ width: 180, maxHeight: 300 }}>
            <input
              onChange={onSearchChange}
              type="text"
              placeholder="Search"
              className="instrument-searchbox"
            />

            {instrumentList.map(({ label, value }) => (
              <div
                className={cn("instrument-list", {
                  selected: value === instrument
                })}
                key={value}
                onClick={() => {
                  onInstrumentChange(value);
                  close();
                }}
              >
                {label}
              </div>
            ))}
          </div>
        )}
      </Dropdown>
    </>
  );
};

export const WriteModeControls = memo(_WriteModeControls);
