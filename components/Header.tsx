import React, { useState, memo } from "react";
import { colors, Option, OptionGroupRadio, Popper } from "@anarock/pebble";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import Tone from "tone";

import Icon from "@components/Icon";
import {
  headerClass,
  headerLogo,
  headerRight,
  iconNotifier,
  instrumentLabel,
  recordBtn
} from "./styles/Header.styles";
import ModeToggle from "./ModeToggle";
import { HeaderProps } from "./typings/Header";
import { getInstrumentByValue, instruments } from "midi-instruments";
import MidiSelect from "@components/MidiSelect";

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
    <header className={headerClass}>
      <span className={headerLogo}>🎹</span>

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

        <ModeToggle mode={mode} onToggle={onToggleMode} />

        <Popper
          label={({ toggle, isOpen }) => (
            <div className={instrumentLabel} onClick={toggle}>
              {getInstrumentByValue(instrument).name}{" "}
              <span className={isOpen ? "__open__" : undefined}>▼</span>
            </div>
          )}
          placement="bottom"
        >
          {({ toggle }) => (
            <OptionGroupRadio
              onChange={value => {
                onInstrumentChange(value);
                toggle();
              }}
              selected={instrument}
            >
              {Object.keys(instruments).map(id => {
                const { value, name } = instruments[id];
                return <Option key={value} value={value} label={name} />;
              })}
            </OptionGroupRadio>
          )}
        </Popper>
        <div>
          <Icon
            className="icon-padding"
            name={volumeName}
            color={colors.white.base}
            onClick={_toggleMute}
          />
        </div>
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

        <a target="_blank" href="https://github.com/ritz078/raaga">
          <Icon name="github" color={colors.white.base} size={23} />
        </a>
      </div>
    </header>
  );
};

export default memo(Header);
