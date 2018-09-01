import * as React from "react";
import SoundFont from "soundfont-player";
import { SoundPlayerProps, SoundPlayerState } from "./typings/SoundPlayer";

// @ts-ignore
import instruments from "soundfont-player/instruments.json";
import Settings from "@components/Settings";

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

  componentDidMount() {
    this.ac = new AudioContext();
    this.load();
  }

  componentWillUnmount() {
    this.ac.close();
  }

  play = midi => this.state.player.play(midi);

  stop = midi => this.state.player.stop(midi);

  render() {
    const { instrument, loading } = this.state;

    return (
      <div>
        <Settings
          instrument={instrument}
          onInstrumentChange={id => this.setState({ instrument: id })}
        />

        {this.state.player &&
          this.props.children({
            play: this.play,
            stop: this.stop,
            loading: loading
          })}
      </div>
    );
  }
}
