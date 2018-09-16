import * as React from "react";
import { headerClass } from "../pages/styles/main.styles";
import { mixins } from "@anarock/pebble";
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
import { Transition, animated } from "react-spring";

interface HeaderProps {
  dispatch: Dispatch;
}

class Header extends React.Component<HeaderProps> {
  worker: Worker;

  state = {
    showTrackSelectionModal: false,
    tempLoadedMidi: undefined
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

  render() {
    const { showTrackSelectionModal, tempLoadedMidi } = this.state;

    return (
      <>
        <header className={headerClass}>
          <div />
          <div style={mixins.flexSpaceBetween}>
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
                        className={trackRow}
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
                        <div className="__play__">
                          <i className="icon icon-play" />
                        </div>
                      </div>
                    ))}
                </div>
              </animated.div>
            ))}
        </Transition>
      </>
    );
  }
}

export default connect()(Header);
