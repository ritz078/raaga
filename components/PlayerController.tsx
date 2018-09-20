import * as React from "react";
import { cx } from "emotion";
import Tone from "tone";
import Draggable from "react-draggable";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import {
  playerController,
  progressBar
} from "@components/styles/PlayerController.styles";
import { labelClass, popperClass } from "@components/styles/Settings.styles";
import { Popper, Option, OptionGroupRadio, utils } from "@anarock/pebble";

// @ts-ignore
import instruments from "soundfont-player/instruments.json";

export interface PlayerControllerProps {
  isPlaying: boolean;
  mode: VISUALIZER_MODE;
  instrument: string;
  onInstrumentChange: (id: string) => void;
}

interface PlayerControllerState {
  progress: number;
  mute: boolean;
}

export default class extends React.PureComponent<
  PlayerControllerProps,
  PlayerControllerState
> {
  progressInterval: number;

  state = {
    mute: false,
    progress: 0
  };

  private clean = (str: string) => utils.capitalize(str.replace(/_/g, " "));

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

  componentDidUpdate(prevProps: PlayerControllerProps) {
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
      isPlaying,
      instrument = instruments[0],
      onInstrumentChange
    } = this.props;
    const { mute, progress } = this.state;

    const className = cx({
      "icon-play": isPlaying,
      "icon-pause": !isPlaying
    });

    const volumeClass = cx({
      "icon-volume": !mute,
      "icon-volume-mute": mute
    });

    return (
      <Draggable bounds="parent">
        <div className={playerController}>
          <i className={className} />

          <div className={progressBar}>
            <div
              className={"__track__"}
              style={{
                width: `${progress * 100}%`
              }}
            />
          </div>

          <i className={volumeClass} onClick={this.toggleMute} />

          <i
            className="icon-upload"
            style={{
              fontSize: 16,
              marginLeft: 20
            }}
          />

          <i
            className="icon-midi"
            style={{
              fontSize: 16,
              marginLeft: 20
            }}
          />

          <Popper
            label={({ toggle }) => (
              <span className={labelClass} onClick={toggle}>
                {this.clean(instrument)} &nbsp;
                <span style={{ fontSize: 8 }}>▶</span>
              </span>
            )}
            placement="auto"
            popperClassName={popperClass}
          >
            {({ toggle }) => (
              <OptionGroupRadio
                onChange={id => {
                  id && onInstrumentChange(id as string);
                  toggle();
                }}
                selected={instrument}
              >
                {instruments.map(name => (
                  <Option key={name} value={name} label={this.clean(name)} />
                ))}
              </OptionGroupRadio>
            )}
          </Popper>
        </div>
      </Draggable>
    );
  }
}
