import React, { useState, memo } from "react";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import Tone from "tone";
import { headerClass, headerRight, instrumentLabel } from "./Header.styles";
import { getInstrumentByValue, instruments } from "midi-instruments";
import MidiSelect from "@components/MidiSelect";
import { SelectMenu, Position, Icon } from "evergreen-ui";
import { AnyAction, Dispatch } from "redux";
import ProgressBar from "@components/ProgressBar";
import { IMidiJSON, INote } from "@typings/midi";
import { PlaybackSpeed } from "@components/PlaybackSpeed";

export interface HeaderProps {
  dispatch: Dispatch<AnyAction>;
  mode: VISUALIZER_MODE;
  instrument: string;
  onTogglePlay: () => void;
  onInstrumentChange: (instrument: React.ReactText) => void;
  notes?: INote[];
  onTrackSelect?: (midi: IMidiJSON, i) => void;
  midiDeviceId: string;
  isPlaying: boolean;
  midiDuration: number;
}

const instrumentOptions = Object.keys(instruments).map(id => {
  const { name, value } = instruments[id];
  return {
    label: name,
    value
  };
});

const _Header: React.FunctionComponent<HeaderProps> = ({
  dispatch,
  mode,
  instrument,
  onInstrumentChange,
  midiDeviceId,
  onTogglePlay,
  isPlaying,
  midiDuration
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
      <span />
      <div className={headerRight}>
        <Icon icon={playName} color="#fff" size={25} onClick={onTogglePlay} />

        <ProgressBar duration={midiDuration} />

        <PlaybackSpeed />

        {mode === VISUALIZER_MODE.WRITE && (
          <SelectMenu
            options={instrumentOptions}
            selected={instrument}
            onSelect={item => {
              onInstrumentChange(item.value);
            }}
            title="Instruments"
            position={Position.BOTTOM}
            closeOnSelect
          >
            <div className={instrumentLabel}>
              {getInstrumentByValue(instrument).name}
            </div>
          </SelectMenu>
        )}

        <Icon
          icon={volumeName}
          color={"#fff"}
          onClick={_toggleMute}
          size={25}
          cursor="pointer"
          marginX={15}
        />

        <MidiSelect dispatch={dispatch} midiDeviceId={midiDeviceId} />
      </div>
    </div>
  );
};

export const Header = memo(_Header);
