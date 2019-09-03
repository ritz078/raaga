import React, { memo, useRef, useState } from "react";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import Tone from "tone";
import { getInstrumentByValue, instruments } from "midi-instruments";
import MidiSelect from "@components/MidiSelect";
import { ProgressBar } from "@components/ProgressBar";
import { IMidiJSON, INote } from "@typings/midi";
import { PlaybackSpeed } from "@components/PlaybackSpeed";
import { Button } from "@components/Button";
import { Range } from "@utils/typings/Visualizer";
import { Icon } from "@components/Icon";
import { Dropdown } from "@components/Dropdown";
import FuzzySearch from "fuzzy-search";
import cn from "@sindresorhus/class-names";
import { PianoRangeSelector } from "@components/PianoRangeSelector";

export interface HeaderProps {
  mode: VISUALIZER_MODE;
  instrument: string;
  onTogglePlay: () => void;
  onInstrumentChange: (instrument: React.ReactText) => void;
  notes?: INote[];
  onTrackSelect?: (midi: IMidiJSON, i) => void;
  midiDeviceId: string;
  isPlaying: boolean;
  midi: IMidiJSON;
  range: Range;
  onRangeChange: (range: number[]) => void;
  onMidiDeviceChange: (midiDevice: string) => void;
}

const instrumentOptions = Object.keys(instruments).map(id => {
  const { name, value } = instruments[id];
  return {
    label: name,
    value
  };
});

const _Header: React.FunctionComponent<HeaderProps> = ({
  mode,
  instrument,
  onInstrumentChange,
  midiDeviceId,
  onTogglePlay,
  isPlaying,
  midi,
  range,
  onRangeChange,
  onMidiDeviceChange
}) => {
  const [mute, toggleMute] = useState(false);
  const fuzzySearch = useRef(new FuzzySearch(instrumentOptions, ["label"]));
  const [instrumentList, setInstrumentList] = useState(instrumentOptions);

  const _toggleMute = () => {
    Tone.Master.mute = !mute;
    toggleMute(!mute);
  };

  const volumeName = mute ? "volume-off" : "volume";
  const playName = isPlaying ? "pause" : "play";

  const onSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    setInstrumentList(fuzzySearch.current.search(e.currentTarget.value));
  };

  return (
    <div className="header">
      <div className="flex flex-row items-center pl-4">
        {midi && mode === VISUALIZER_MODE.READ && (
          <>
            <Button className="h-8 mr-2">
              <div className="header-midi-name" title={midi.header.name[0]}>
                {midi.header.label}
              </div>
            </Button>
            <div className="player-wrapper">
              <Icon
                name={playName}
                color="#fff"
                size={13}
                className="cursor-pointer"
                onClick={onTogglePlay}
              />

              <ProgressBar duration={midi && midi.duration} />
            </div>

            <PlaybackSpeed />
          </>
        )}

        {mode === VISUALIZER_MODE.WRITE && (
          <PianoRangeSelector range={range} onRangeChange={onRangeChange} />
        )}
      </div>

      <div className="flex flex-row justify-between items-center">
        {mode === VISUALIZER_MODE.WRITE && (
          <Dropdown
            contentClassName={"instrument-selector"}
            label={() => (
              <Button className="h-8">
                {getInstrumentByValue(instrument).name}
              </Button>
            )}
          >
            {close => {
              return (
                <div className="py-2" style={{ width: 180 }}>
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
              );
            }}
          </Dropdown>
        )}

        <Icon
          name={volumeName}
          color={"#fff"}
          onClick={_toggleMute}
          size={18}
          className="mx-4 cursor-pointer"
        />

        <MidiSelect
          onMidiDeviceChange={onMidiDeviceChange}
          midiDeviceId={midiDeviceId}
        />
      </div>
    </div>
  );
};

export const Header = memo(_Header);
