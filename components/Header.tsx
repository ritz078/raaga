import React, { useState, useCallback, memo } from "react";
import {
  colors,
  Popper,
  OptionGroupRadio,
  Option,
  SideBar
} from "@anarock/pebble";
import { ReducersType } from "@enums/reducers";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import Tone from "tone";

import Icon from "@components/Icon";
import {
  headerRight,
  headerClass,
  instrumentLabel,
  iconClass,
  recordBtn,
  headerLogo
} from "./styles/Header.styles";
import ModeToggle from "./ModeToggle";
import { HeaderProps } from "./typings/Header";
import { getInstrumentByValue, instruments } from "midi-instruments";

const Header: React.SFC<HeaderProps> = ({
  dispatch,
  mode,
  instrument,
  onInstrumentChange,
  isRecording,
  toggleRecording
}) => {
  const [mute, toggleMute] = useState(false);

  const _toggleMute = useCallback(() => {
    Tone.Master.mute = !mute;
    toggleMute(!mute);
  });

  const toggleMode = useCallback((mode: VISUALIZER_MODE) =>
    dispatch({
      type: ReducersType.CHANGE_SETTINGS,
      payload: {
        mode
      }
    })
  );

  const volumeName = mute ? "volume-mute" : "volume";

  return (
    <header className={headerClass}>
      <span className={headerLogo}>🎹</span>

      <div className={headerRight}>
        <button className={recordBtn} onClick={toggleRecording}>
          <Icon
            name={isRecording ? "stop" : "record"}
            size={12}
            color={colors.red.base}
          />{" "}
          &nbsp;&nbsp;&nbsp;
          {isRecording ? "Stop" : "Record"}
        </button>

        <ModeToggle mode={mode} onToggle={toggleMode} />

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
        <Icon
          className={iconClass}
          name={volumeName}
          color={colors.white.base}
          onClick={_toggleMute}
        />
        <Icon className={iconClass} name="tracks" color={colors.white.base} />
        <Icon className={iconClass} name="midi" color={colors.white.base} />
        <SideBar isOpen={false} width={500} closeOnOutsideClick>
          <div />
        </SideBar>
      </div>
    </header>
  );
};

export default memo(Header);
