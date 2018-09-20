import * as React from "react";
import { headerClass } from "../pages/styles/main.styles";
import { mixins, OutsideClick } from "@anarock/pebble";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import MidiLoadWorker from "@workers/midiload.worker";
import { ReducersType } from "@enums/reducers";
import prettyMs from "pretty-ms";
import {
  modalBottom,
  modalTop,
  trackRow,
  trackSelectionModal
} from "@components/styles/Header.styles";
import { animated, Transition } from "react-spring";
import { css, cx } from "emotion";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import Tone from "tone";
import { progressBar } from "@components/styles/PlayerController.styles";

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

    const className = cx({
      "icon-play": isPlaying,
      "icon-pause": !isPlaying
    });

    const volumeClass = cx({
      "icon-volume": !mute,
      "icon-volume-mute": mute
    });

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
                    <i
                      className={className}
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
          <div style={mixins.flexSpaceBetween}>
            <i className={volumeClass} onClick={this.toggleMute} />
            <label htmlFor="upload-midi" style={{ display: "flex" }}>
              <i className="icon icon-upload" />
            </label>
            <input
              onChange={this.loadFile}
              hidden
              type="file"
              name="photo"
              id="upload-midi"
              accept=".mid"
            />
            <i className="icon icon-midi" />
          </div>
        </header>

        <Transition
          native
          from={{ opacity: 0, marginTop: 40 }}
          enter={{ opacity: 1, marginTop: 0 }}
          leave={{ opacity: 0, marginTop: 40, pointerEvents: "none" }}
        >
          {showTrackSelectionModal &&
            (styles => (
              <animated.div style={styles} className={trackSelectionModal}>
                <OutsideClick
                  onOutsideClick={() =>
                    this.setState({
                      showTrackSelectionModal: false
                    })
                  }
                >
                  <div className={modalTop}>
                    <h2>
                      {(tempLoadedMidi.header && tempLoadedMidi.header.name) ||
                        "Unnamed"}
                    </h2>
                  </div>

                  <div className={modalBottom}>
                    {tempLoadedMidi.tracks &&
                      tempLoadedMidi.tracks.map((track, i) => (
                        <div
                          onClick={() => this.selectTrack(i)}
                          className={cx(trackRow, {
                            __disabled__: !track.duration
                          })}
                          key={i}
                          data-index={i}
                        >
                          <div style={{ paddingRight: 20 }}>#{i + 1}</div>
                          <div className="__name__">
                            {track.name || "Unnamed"}
                          </div>
                          <div style={{ flex: 1 }}>
                            {track.instrument || "N/A"}
                          </div>
                          <div style={{ flex: 0.5 }}>
                            {prettyMs(track.duration * 1000)}
                          </div>
                          <div style={{ flex: 0.5 }}>
                            {track.notes && track.notes.length} Notes
                          </div>
                          <div className="__play__">
                            {!!track.duration && (
                              <i className="icon icon-play" />
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </OutsideClick>
              </animated.div>
            ))}
        </Transition>
      </>
    );
  }
}

const mapStateToProps = ({ settings }) => ({ settings });

export default connect(mapStateToProps)(Header);
