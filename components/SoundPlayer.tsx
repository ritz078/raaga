import * as React from "react";
import { SoundPlayerProps, SoundPlayerState } from "./typings/SoundPlayer";
import Settings from "@components/Settings";

// @ts-ignore
import instruments from "soundfont-player/instruments.json";
import Player from "../utils/Player";
import Recorder from "../utils/Recorder";

export default class SoundPlayer extends React.PureComponent<
  SoundPlayerProps,
  SoundPlayerState
> {
  player: Player;
  recorder: Recorder;

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
    this.recorder = new Recorder();
    this.player = new Player(this.recorder);
    this.loadPlayer();
  }

  private stopRecording = () => {
  	const notes = this.recorder.stopRecording();
  	// recorded notes
  	console.log(notes)

		// playing them
		this.player.scheduleNotes(notes)
	};

  render() {
    const { instrument, loading } = this.state;

    return (
      <div>
        {this.state.playerLoaded && (
          <>
            <Settings
              instrument={instrument}
              onInstrumentChange={id => this.loadPlayer(id)}
              onRecordingStart={this.recorder.startRecording}
              onRecordingEnd={this.stopRecording}
            />
            {this.props.children({
              play: this.player.play,
              stop: this.player.stopNote,
              loading
            })}
          </>
        )}
      </div>
    );
  }
}
