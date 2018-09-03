import * as React from "react";
import { SoundPlayerProps, SoundPlayerState } from "./typings/SoundPlayer";
import Settings from "@components/Settings";
// @ts-ignore
import instruments from "soundfont-player/instruments.json";
import { EVENT_TYPE, EventArgs } from "@utils/typings/Clock";
import { Note } from "@utils/typings/Recorder";
import { Player, Recorder, Clock } from "@utils";

export default class SoundPlayer extends React.PureComponent<
  SoundPlayerProps,
  SoundPlayerState
> {
  player: Player;
  recorder: Recorder;
  clock: Clock;

  state = {
    instrument: instruments[0],
    loading: false,
    playerLoaded: false,
    currentlyPlayingMidis: undefined
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
    this.clock = new Clock(this.player.audioContext());
    this.loadPlayer();
  }

  onRecordPlay = (e: { args: EventArgs }) => {
    const { eventType, note } = e.args;

    this.setState(prevState => {
      const set = new Set(prevState.currentlyPlayingMidis || []);
      if (eventType === EVENT_TYPE.NOTE_START) {
        return { currentlyPlayingMidis: [...set.add(note)] };
      } else if (eventType === EVENT_TYPE.NOTE_STOP) {
        set.delete(note);
        return { currentlyPlayingMidis: [...set] };
      } else if (eventType === EVENT_TYPE.PLAYING_COMPLETE) {
        return { currentlyPlayingMidis: undefined };
      }
    });
  };

  private playRecording = (notes: Note[]) => {
    this.player.scheduleNotes(notes);
    this.clock.setCallbacks(
      notes,
      this.player.audioContext().currentTime,
      this.onRecordPlay
    );
  };

  private stopRecording = () => {
    const notes = this.recorder.stopRecording();

    this.playRecording(notes);
  };

  render() {
    const {
      instrument,
      loading,
      currentlyPlayingMidis,
      playerLoaded
    } = this.state;

    return (
      <div>
        {playerLoaded && (
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
              loading,
              currentlyPlayingMidis
            })}
          </>
        )}
      </div>
    );
  }
}
