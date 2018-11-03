import * as React from "react";
import { colors } from "@anarock/pebble";
import { connect } from "react-redux";
import { ReducersType } from "@enums/reducers";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import Tone from "tone";

import { Icon } from "@assets/svgs";
import { headerRight, headerClass } from "@components/styles/Header.styles";
import ModeToggle from "@components/ModeToggle";
import { HeaderProps, HeaderState } from "./typings/Header";

class Header extends React.Component<HeaderProps, HeaderState> {
  state = {
    mute: false
  };

  private toggleMute = () => {
    this.setState(
      {
        mute: !this.state.mute
      },
      () => {
        Tone.Master.mute = this.state.mute;
      }
    );
  };

  toggleMode = (mode: VISUALIZER_MODE) =>
    this.props.dispatch({
      type: ReducersType.CHANGE_SETTINGS,
      payload: {
        mode
      }
    });

  render() {
    const { mute } = this.state;
    const { settings } = this.props;
    const { mode } = settings;

    const volumeName = mute ? "volume-mute" : "volume";

    return (
      <>
        <header className={headerClass}>
          <ModeToggle mode={mode} onToggle={this.toggleMode} />

          <div className={headerRight}>
            <Icon
              name={volumeName}
              color={colors.white.base}
              onClick={this.toggleMute}
            />
            {/*{!isEmpty(this.state.tempLoadedMidi) && (*/}
            {/*<Icon*/}
            {/*name="tracks"*/}
            {/*color={colors.white.base}*/}
            {/*onClick={() =>*/}
            {/*this.setState({*/}
            {/*showTrackSelectionModal: true*/}
            {/*})*/}
            {/*}*/}
            {/*/>*/}
            {/*)}*/}
            <Icon name="midi" color={colors.white.base} />
          </div>
        </header>
      </>
    );
  }
}

const mapStateToProps = ({ settings }) => ({
  settings
});

// @ts-ignore
export default connect(mapStateToProps)(Header);
