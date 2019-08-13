import * as React from "react";
import dynamic from "next/dynamic";
import { bodyClass, mainHeader, playerWrapper } from "@styles/main.styles";
import { headerLogo } from "@components/styles/Header.styles";
import Icon from "@components/Icon";
import { colors } from "@anarock/pebble";
import { Pane } from "evergreen-ui";
import { connect } from "react-redux";
import { Store } from "@typings/store";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import { ReducersType } from "@enums/reducers";
import ModeToggle from "@components/ModeToggle";

const SoundPlayer = dynamic((() => import("@components/SoundPlayer")) as any, {
  ssr: false
});

function Main({ dispatch, settings }) {
  const toggleMode = (mode: VISUALIZER_MODE) => {
    dispatch({
      type: ReducersType.CHANGE_SETTINGS,
      payload: {
        mode
      }
    });
  };

  return (
    <div className={bodyClass}>
      <header className={mainHeader}>
        <span className={headerLogo}>🎹</span>

        <Pane display="flex" alignItems="center">
          <ModeToggle
            mode={settings.mode}
            onToggle={toggleMode}
            disabled={false}
          />

          <a target="_blank" href="https://github.com/ritz078/raaga">
            <Icon name="github" color={colors.white.base} size={23} />
          </a>
        </Pane>
      </header>
      <div className={playerWrapper}>
        <SoundPlayer />
      </div>
    </div>
  );
}

export default connect(({ settings }: Store) => ({ settings }))(Main);
