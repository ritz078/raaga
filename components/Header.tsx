import * as React from "react";
import { colors } from "@anarock/pebble";
import { connect } from "react-redux";
import MidiLoadWorker from "@workers/midiload.worker";
import { ReducersType } from "@enums/reducers";
import { animated, Transition } from "react-spring";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import Tone from "tone";
import ProgressBar from "./ProgressBar";
import { isEmpty } from "lodash";
import TrackSelectionModal from "@components/TrackSelectionModal";

import { Icon } from "@assets/svgs";
import {
  headerRight,
  headerClass,
  playPause
} from "@components/styles/Header.styles";
import ModeToggle from "@components/ModeToggle";
import { HeaderProps, HeaderState } from "./typings/Header";

class Header extends React.Component<HeaderProps, HeaderState> {
  worker: Worker;

  state = {
    showTrackSelectionModal: false,
    tempLoadedMidi: undefined,
    mute: false
  };

  private loadFile = e => {
    const file = e.target.files[0];
    this.worker.postMessage(file);
  };

  componentDidMount() {
    this.worker = new MidiLoadWorker();
    this.worker.onmessage = e => {
      if (e.data.error) {
        alert(e.data.error);
        return;
      }

      this.setState({
        showTrackSelectionModal: true,
        tempLoadedMidi: e.data.data
      });
    };
  }

  private selectTrack = (i: number) => {
    const { tempLoadedMidi } = this.state;

    this.props.dispatch({
      type: ReducersType.LOADED_MIDI,
      payload: tempLoadedMidi
    });
    this.props.dispatch({
      type: ReducersType.SET_SELECTED_TRACK,
      payload: tempLoadedMidi.tracks[i]
    });

    this.setState({
      showTrackSelectionModal: false
    });
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
    const { showTrackSelectionModal, tempLoadedMidi, mute } = this.state;
    const { isPlaying, settings } = this.props;
    const { mode } = settings;

    const playPauseIconName = isPlaying ? "pause" : "play";
    const volumeName = mute ? "volume-mute" : "volume";

    return (
      <>
        <header className={headerClass}>
          <ModeToggle mode={mode} onToggle={this.toggleMode} />

          <>
            <Transition
              native
              from={{ opacity: 0 }}
              enter={{ opacity: 1 }}
              leave={{ opacity: 0, pointerEvents: "none" }}
            >
              {mode === VISUALIZER_MODE.READ &&
                (styles => (
                  <animated.div style={styles} className={playPause}>
                    <Icon
                      name={playPauseIconName}
                      color={colors.white.base}
                      onClick={this.props.onTogglePlay}
                    />

                    <ProgressBar />
                  </animated.div>
                ))}
            </Transition>
          </>

          <div className={headerRight}>
            <Icon
              name={volumeName}
              color={colors.white.base}
              onClick={this.toggleMute}
            />

            <label htmlFor="upload-midi" style={{ display: "flex" }}>
              <Icon name="upload" color={colors.white.base} />
            </label>
            <input
              onChange={this.loadFile}
              hidden
              type="file"
              name="photo"
              id="upload-midi"
              accept=".mid"
            />
            {!isEmpty(this.state.tempLoadedMidi) && (
              <Icon
                name="tracks"
                color={colors.white.base}
                onClick={() =>
                  this.setState({
                    showTrackSelectionModal: true
                  })
                }
              />
            )}
            <Icon name="midi" color={colors.white.base} />
          </div>
        </header>

        <TrackSelectionModal
          visible={showTrackSelectionModal}
          midi={tempLoadedMidi}
          onSelectTrack={this.selectTrack}
          onClose={() =>
            this.setState({
              showTrackSelectionModal: false
            })
          }
        />
      </>
    );
  }
}

const mapStateToProps = ({ settings }) => ({
  settings
});

// @ts-ignore
export default connect(mapStateToProps)(Header);
