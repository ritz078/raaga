import React, { useState, memo } from "react";
import { colors } from "@anarock/pebble";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import Tone from "tone";
import Icon from "@components/Icon";
import {
  headerClass,
  headerRight,
  instrumentLabel,
  recordBtn
} from "./Header.styles";
import { getInstrumentByValue, instruments } from "midi-instruments";
import MidiSelect from "@components/MidiSelect";
import { SelectMenu, Position, Pane } from "evergreen-ui";
import { AnyAction, Dispatch } from "redux";
import { MidiJSON, Note } from "@utils/midiParser/midiParser";

export interface HeaderProps {
  dispatch: Dispatch<AnyAction>;
  mode: VISUALIZER_MODE;
  instrument: string;
  onTogglePlay: () => void;
  onInstrumentChange: (instrument: React.ReactText) => void;
  isRecording: boolean;
  toggleRecording: () => void;
  notes?: Note[];
  onTrackSelect?: (midi: MidiJSON, i) => void;
  midiDeviceId: string;
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
  isRecording,
  toggleRecording,
  midiDeviceId
}) => {
  const [mute, toggleMute] = useState(false);

  const _toggleMute = () => {
    Tone.Master.mute = !mute;
    toggleMute(!mute);
  };

  const volumeName = mute ? "volume-mute" : "volume";

  return (
    <div className={headerClass}>
      <span></span>
      <div className={headerRight}>
        {mode === VISUALIZER_MODE.WRITE && (
          <button className={recordBtn} onClick={toggleRecording}>
            <Icon
              name={isRecording ? "stop" : "record"}
              size={12}
              color={colors.red.base}
            />
            &nbsp;&nbsp;&nbsp;
            {isRecording ? "Stop" : "Record"}
          </button>
        )}

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
            <Pane className={instrumentLabel}>
              {getInstrumentByValue(instrument).name}
            </Pane>
          </SelectMenu>
        )}

        <Icon
          className="icon-padding"
          name={volumeName}
          color={colors.white.base}
          onClick={_toggleMute}
        />

        <MidiSelect dispatch={dispatch} midiDeviceId={midiDeviceId} />
      </div>
    </div>
  );
};

export const Header = memo(_Header);
