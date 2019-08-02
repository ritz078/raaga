import React, { useState, memo } from "react";
import { colors } from "@anarock/pebble";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import Tone from "tone";
import Icon from "@components/Icon";
import {
  headerClass,
  headerRight,
  iconNotifier,
  instrumentLabel,
  recordBtn
} from "./styles/Header.styles";
import ModeToggle from "./ModeToggle";
import { HeaderProps } from "./typings/Header";
import { getInstrumentByValue, instruments } from "midi-instruments";
import MidiSelect from "@components/MidiSelect";
import { SelectMenu, Position, Pane } from "evergreen-ui";

const instrumentOptions = Object.keys(instruments).map(id => {
  const { name, value } = instruments[id];
  return {
    label: name,
    value
  };
});

const Header: React.FunctionComponent<HeaderProps> = ({
  dispatch,
  mode,
  instrument,
  onInstrumentChange,
  isRecording,
  toggleRecording,
  recordings,
  midiDeviceId,
  onToggleMode,
  onToggleSidebar
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

        <ModeToggle
          mode={mode}
          onToggle={onToggleMode}
          disabled={isRecording}
        />

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

        <Icon
          className="icon-padding"
          name={volumeName}
          color={colors.white.base}
          onClick={_toggleMute}
        />

        <div>
          {!!recordings.length && (
            <span className={iconNotifier}>{recordings.length}</span>
          )}
          <Icon
            onClick={onToggleSidebar}
            className="icon-padding"
            name="tracks"
            color={colors.white.base}
          />
        </div>

        <MidiSelect dispatch={dispatch} midiDeviceId={midiDeviceId} />
      </div>
    </div>
  );
};

export default memo(Header);
