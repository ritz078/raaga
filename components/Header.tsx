import React, { useState, useCallback, memo } from "react";
import { colors } from "@anarock/pebble";
import { ReducersType } from "@enums/reducers";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import Tone from "tone";

import { Icon } from "@assets/svgs";
import { headerRight, headerClass } from "@components/styles/Header.styles";
import ModeToggle from "@components/ModeToggle";
import { HeaderProps } from "./typings/Header";

const Header: React.SFC<HeaderProps> = ({ dispatch, mode }) => {
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
    <>
      <header className={headerClass}>
        <ModeToggle mode={mode} onToggle={toggleMode} />

        <div className={headerRight}>
          <Icon
            name={volumeName}
            color={colors.white.base}
            onClick={_toggleMute}
          />
          <Icon name="midi" color={colors.white.base} />
        </div>
      </header>
    </>
  );
};

export default memo(Header);
