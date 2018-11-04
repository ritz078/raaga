import React, { useState, useCallback, memo } from "react";
import { colors, Popper, OptionGroupRadio, Option } from "@anarock/pebble";
import { ReducersType } from "@enums/reducers";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import Tone from "tone";

import Icon from "@components/Icon";
import {
  headerRight,
  headerClass,
  instrumentLabel
} from "./styles/Header.styles";
import ModeToggle from "./ModeToggle";
import { HeaderProps } from "./typings/Header";
import { getInstrumentByValue, instruments } from "midi-instruments";

const Header: React.SFC<HeaderProps> = ({
  dispatch,
  mode,
  instrument,
  onInstrumentChange
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
      <span
        style={{
          fontSize: 24,
          display: "inline-flex",
          marginRight: 30,
          alignItems: "center"
        }}
      >
        🎹
      </span>

      <div className={headerRight}>
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
          name={volumeName}
          color={colors.white.base}
          onClick={_toggleMute}
        />
        <Icon name="midi" color={colors.white.base} />
      </div>
    </header>
  );
};

export default memo(Header);
