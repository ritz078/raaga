import * as React from "react";
import { SoundPlayerProps, SoundPlayerState } from "./typings/SoundPlayer";
import Settings from "@components/Settings";

// @ts-ignore
import instruments from "soundfont-player/instruments.json";
import Player from "../utilities/Player";

export default class SoundPlayer extends React.PureComponent<
  SoundPlayerProps,
  SoundPlayerState
> {
  player: Player;

  state = {
    instrument: instruments[0],
    loading: false,
    playerLoaded: false
  };

  private loadPlayer = (instrument = this.state.instrument) => {
    this.setState({ loading: true });

    this.player.load(instrument, () => {
      this.setState({
        playerLoaded: true,
        instrument,
        loading: false
      });
    });
  };

  componentDidMount() {
    this.player = new Player();
    this.loadPlayer();
  }

  render() {
    const { instrument, loading } = this.state;

    return (
      <div>
        <Settings
          instrument={instrument}
          onInstrumentChange={id => this.loadPlayer(id)}
        />

        {this.state.playerLoaded &&
          this.props.children({
            play: this.player.play,
            stop: this.player.stopNote,
            loading
          })}
      </div>
    );
  }
}
