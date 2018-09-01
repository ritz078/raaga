import * as React from "react";
import SoundFont from "soundfont-player";
import { Popper, OptionGroupRadio, Option } from "@anarock/pebble";
import {labelClass, popperClass, settingsWrapper} from "./styles/SoundPlayer.styles";
import { SoundPlayerProps, SoundPlayerState } from "./typings/SoundPlayer";
import capitalize from "capitalize"

// @ts-ignore
import instruments from "soundfont-player/instruments.json";

export default class SoundPlayer extends React.PureComponent<
  SoundPlayerProps,
  SoundPlayerState
> {
	ac: AudioContext;

  state = {
    player: undefined,
    instrument: instruments[0],
    loading: false
  };

  load = () => {
    this.setState({ loading: true });
    SoundFont.instrument(this.ac, this.state.instrument).then(player => {
      this.setState({
        player,
        loading: false
      });
    });
  };

  clean = (str: string) => {
    return capitalize(str.replace(/_/g, " "));
  };

  componentDidMount() {
  	this.ac = new AudioContext();
    this.load();
  }

  componentWillUnmount () {
  	this.ac.close();
	}

  play = midi => this.state.player.play(midi);

  stop = midi => this.state.player.stop(midi);

  render() {
  	const { instrument, loading } = this.state;

    return (
      <div>
        <div className={settingsWrapper}>
          <Popper
            label={({ toggle }) => (
              <span className={labelClass} onClick={toggle}>
									{this.clean(instrument)} &nbsp;
									<span style={{fontSize: 9}}>▶</span>
              </span>
            )}
            placement="right"
            popperClassName={popperClass}
          >
            {({ toggle }) => (
              <OptionGroupRadio
                onChange={id =>
                  id &&
                  this.setState(
                    {
                      instrument: id as string
                    },
                    () => {
                      this.load();
                      toggle();
                    }
                  )
                }
                selected={instrument}
              >
                {instruments.map(name => (
                  <Option
                    key={name}
                    value={name}
                    label={this.clean(name)}
                  />
                ))}
              </OptionGroupRadio>
            )}
          </Popper>
        </div>

        {(this.state.player &&
          this.props.children({
            play: this.play,
            stop: this.stop,
						loading: loading
          })) ||
          null}
      </div>
    );
  }
}
