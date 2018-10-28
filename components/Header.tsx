import * as React from "react";
import { headerClass } from "../pages/styles/main.styles";
import { colors, mixins } from "@anarock/pebble";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import MidiLoadWorker from "@workers/midiload.worker";
import { ReducersType } from "@enums/reducers";
import { animated, Transition } from "react-spring";
import { css } from "emotion";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import Tone from "tone";
import { progressBar } from "@components/styles/PlayerController.styles";
import { isEmpty } from "lodash";
import TrackSelectionModal from "@components/TrackSelectionModal";

import { Icon } from "@assets/svgs";
import { headerRight } from "@components/styles/Header.styles";

interface HeaderProps {
  dispatch: Dispatch;
  mode: VISUALIZER_MODE;
  instrument: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const playPause = css({
  ...mixins.flexSpaceBetween,
  width: 300,
  ...mixins.flexMiddleAlign
});

class Header extends React.Component<HeaderProps> {
  worker: Worker;
  progressInterval: number;

  state = {
    showTrackSelectionModal: false,
    tempLoadedMidi: undefined,
    mute: false,
    progress: 0
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

    this.reportProgress();
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

  private reportProgress = () => {
    if (this.props.mode === VISUALIZER_MODE.READ) {
      this.progressInterval = window.setInterval(
        () =>
          this.setState({
            progress: Tone.Transport.seconds / Tone.Transport.duration
          }),
        500
      );
    } else {
      this.clearInterval();
    }
  };

  private clearInterval = () =>
    this.progressInterval && window.clearInterval(this.progressInterval);

  componentDidUpdate(prevProps: HeaderProps) {
    if (prevProps.mode !== this.props.mode) {
      this.reportProgress();
    }
  }

  componentWillMount() {
    this.clearInterval();
  }

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

  render() {
    const {
      showTrackSelectionModal,
      tempLoadedMidi,
      mute,
      progress
    } = this.state;
    const { isPlaying, mode } = this.props;

    const playPauseIconName = isPlaying ? "pause" : "play";
    const volumeName = mute ? "volume-mute" : "volume";

    return (
      <>
        <header className={headerClass}>
          <div>
            <Transition
              native
              from={{ opacity: 0, marginTop: -60 }}
              enter={{ opacity: 1, marginTop: 0 }}
              leave={{ opacity: 0, marginTop: -60, pointerEvents: "none" }}
            >
              {mode === VISUALIZER_MODE.READ &&
                (styles => (
                  <animated.div style={styles} className={playPause}>
                    <Icon
                      name={playPauseIconName}
                      color={colors.white.base}
                      onClick={this.props.onTogglePlay}
                    />

                    <div className={progressBar}>
                      <div
                        className={"__track__"}
                        style={{
                          width: `${progress * 100}%`
                        }}
                      />
                    </div>
                  </animated.div>
                ))}
            </Transition>
          </div>
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

export default connect(mapStateToProps)(Header);
