import * as React from "react";
import { headerClass } from "../pages/styles/main.styles";
import { mixins } from "@anarock/pebble";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import MidiLoadWorker from "@workers/midiload.worker";
import { ReducersType } from "@enums/reducers";
import { MIDI } from "midiconvert";
import prettyMs from "pretty-ms";
import {
  trackRow,
  trackSelectionModal
} from "@components/styles/Header.styles";
import { Transition, animated } from "react-spring";

interface HeaderProps {
  dispatch: Dispatch;
  loadedMidi: MIDI;
}

class Header extends React.Component<HeaderProps> {
  worker: Worker;

  state = {
    showTrackSelectionModal: false
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
        showTrackSelectionModal: true
      });

      this.props.dispatch({
        type: ReducersType.CLEAR_TRACK_NUMBER
      });

      this.props.dispatch({
        type: ReducersType.LOADED_MIDI,
        payload: e.data.data || null
      });
    };
  }

  private selectTrack = (i: number) => {
    this.props.dispatch({
      type: ReducersType.SET_TRACK_NUMBER,
      payload: i + 1
    });

    this.setState({
      showTrackSelectionModal: false
    });
  };

  render() {
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
              style={{ display: "none" }}
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
          {this.state.showTrackSelectionModal &&
            (styles => (
              <animated.div style={styles} className={trackSelectionModal}>
                <div
                  style={{
                    height: 100,
                    backgroundColor: "#090a0c7a",
                    padding: 20,
                    color: "#fff",
                    paddingTop: 55
                  }}
                >
                  <h2>
                    {(this.props.loadedMidi.header &&
                      this.props.loadedMidi.header.name) ||
                      "Unnamed"}
                  </h2>
                </div>

                <div
                  style={{
                    flex: 1,
                    overflow: "scroll"
                  }}
                >
                  {this.props.loadedMidi.tracks &&
                    this.props.loadedMidi.tracks.map((track, i) => (
                      <div
                        onClick={() => this.selectTrack(i)}
                        className={trackRow}
                        key={i}
                        data-index={i}
                      >
                        <div style={{ paddingRight: 20 }}>#{i + 1}</div>
                        <div
                          style={{
                            flex: 1,
                            ...mixins.textEllipsis,
                            paddingRight: 30
                          }}
                        >
                          {track.name || "Unnamed"}
                        </div>
                        <div style={{ flex: 1 }}>
                          {track.instrument || "N/A"}
                        </div>
                        <div style={{ flex: 0.5 }}>
                          {prettyMs(track.duration * 1000)}
                        </div>
                        <div
                          style={{
                            fontSize: 14
                          }}
                        >
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

export default connect(({ loadedMidi }) => ({ loadedMidi }))(Header);
