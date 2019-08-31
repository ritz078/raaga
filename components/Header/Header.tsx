import React, { memo, useState } from "react";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import Tone from "tone";
import { getInstrumentByValue, instruments } from "midi-instruments";
import MidiSelect from "@components/MidiSelect";
import { Pane, SelectMenu } from "evergreen-ui";
import { ProgressBar } from "@components/ProgressBar";
import { IMidiJSON, INote } from "@typings/midi";
import { PlaybackSpeed } from "@components/PlaybackSpeed";
import { Button } from "@components/Button";
import { MidiNumbers } from "piano-utils";
import { Range } from "@utils/typings/Visualizer";
import { Icon } from "@components/Icon";

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

const naturalKeys = MidiNumbers.NATURAL_MIDI_NUMBERS.map(midi => {
  const { note } = MidiNumbers.getAttributes(midi);
  return {
    label: note,
    value: midi
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

  const _toggleMute = () => {
    Tone.Master.mute = !mute;
    toggleMute(!mute);
  };

  const volumeName = mute ? "volume-off" : "volume";
  const playName = isPlaying ? "pause" : "play";

  return (
    <div className="header">
      <div className="flex flex-row items-center pl-4">
        {midi && mode === VISUALIZER_MODE.READ && (
          <>
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
          <div className="header-range-wrapper">
            <div className="text-gray-500 text-xs mr-4">Range</div>
            <SelectMenu
              options={naturalKeys}
              selected={range.first}
              onSelect={item => {
                onRangeChange([item.value, range.last]);
              }}
              title="First Key"
              closeOnSelect
            >
              <Pane>
                <Button className="h-6">
                  {MidiNumbers.getAttributes(range.first).note}
                </Button>
              </Pane>
            </SelectMenu>
            <Icon name="minus" color="#fff" size={8} className="mx-2" />
            <SelectMenu
              options={naturalKeys.filter(({ value }) => value > range.first)}
              selected={range.last}
              onSelect={item => {
                onRangeChange([range.first, item.value]);
              }}
              title="Last Key"
              closeOnSelect
            >
              <Pane>
                <Button className="h-6">
                  {MidiNumbers.getAttributes(range.last).note}
                </Button>
              </Pane>
            </SelectMenu>
          </div>
        )}
      </div>

      <div className="flex flex-row justify-between items-center">
        {mode === VISUALIZER_MODE.WRITE && (
          <SelectMenu
            options={instrumentOptions}
            selected={instrument}
            onSelect={item => {
              onInstrumentChange(item.value);
            }}
            title="Instruments"
            closeOnSelect
          >
            <Pane>
              <Button className="h-8 mr-2">
                {getInstrumentByValue(instrument).name}
              </Button>
            </Pane>
          </SelectMenu>
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
