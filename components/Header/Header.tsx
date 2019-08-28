import React, { memo, useState } from "react";
import { colors } from "@anarock/pebble";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import Tone from "tone";
import {
  buttonCn,
  headerClass,
  headerLeft,
  headerRight
} from "./Header.styles";
import { getInstrumentByValue, instruments } from "midi-instruments";
import MidiSelect from "@components/MidiSelect";
import { Icon, Pane, SelectMenu } from "evergreen-ui";
import ProgressBar from "@components/ProgressBar";
import { IMidiJSON, INote } from "@typings/midi";
import { PlaybackSpeed } from "@components/PlaybackSpeed";
import { Button } from "@components/Button";
import { MidiNumbers } from "piano-utils";
import { Range } from "@utils/typings/Visualizer";

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

  const volumeName = mute ? "volume-off" : "volume-up";
  const playName = isPlaying ? "pause" : "play";

  return (
    <div className={headerClass}>
      <div className={headerLeft}>
        {midi && mode === VISUALIZER_MODE.READ && (
          <>
            <Icon
              icon={playName}
              color="#fff"
              size={19}
              onClick={onTogglePlay}
            />

            <ProgressBar duration={midi && midi.duration} />

            <PlaybackSpeed />
          </>
        )}

        {mode === VISUALIZER_MODE.WRITE && (
          <>
            <Pane color="#fff" marginRight={15} fontSize={14}>
              Range
            </Pane>
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
                <Button className={buttonCn}>
                  {MidiNumbers.getAttributes(range.first).note}
                </Button>
              </Pane>
            </SelectMenu>
            <Icon icon="minus" color="#fff" size={12} marginX={10} />
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
                <Button className={buttonCn}>
                  {MidiNumbers.getAttributes(range.last).note}
                </Button>
              </Pane>
            </SelectMenu>
          </>
        )}
      </div>

      <div className={headerRight}>
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
              <Button className={buttonCn}>
                {getInstrumentByValue(instrument).name}
              </Button>
            </Pane>
          </SelectMenu>
        )}

        <Icon
          icon={volumeName}
          color={colors.white.base}
          onClick={_toggleMute}
          size={18}
          cursor="pointer"
          marginX={15}
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
