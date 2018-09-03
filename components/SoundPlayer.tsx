import * as React from "react";
import { SoundPlayerState } from "./typings/SoundPlayer";
import Settings from "@components/Settings";
import { EVENT_TYPE, EventArgs } from "@utils/typings/Clock";
import { Note } from "@utils/typings/Recorder";
import { Player, Recorder, Clock } from "@utils";
import {
  loaderClass,
  piano,
  pianoWrapperClass
} from "@components/styles/SoundPlayer.styles";
import { colors, Loader } from "@anarock/pebble";
import { css, cx } from "emotion";
import { Piano } from "react-piano-fork";
import { getPianoRangeAndShortcuts } from "@config/piano";

// @ts-ignore
import instruments from "soundfont-player/instruments.json";

const { range, keyboardShortcuts } = getPianoRangeAndShortcuts("c3", "c6");

export default class SoundPlayer extends React.PureComponent<
  {},
  SoundPlayerState
> {
  player: Player;
  recorder: Recorder;
  clock: Clock;

  state: SoundPlayerState = {
    instrument: instruments[0],
    loading: false,
    playerLoaded: false,
    activeMidis: undefined
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
    this.clock = new Clock(this.player.audioContext);
    this.loadPlayer();
  }

  onRecordPlay = (e: { args: EventArgs }) => {
    const { eventType, note } = e.args;

    this.setState(prevState => {
      const set = new Set(prevState.activeMidis || []);
      if (eventType === EVENT_TYPE.NOTE_START) {
        return { activeMidis: [...set.add(note)] };
      } else if (eventType === EVENT_TYPE.NOTE_STOP) {
        set.delete(note);
        return { activeMidis: [...set] };
      } else if (eventType === EVENT_TYPE.PLAYING_COMPLETE) {
        return { activeMidis: undefined };
      }
    });
  };

  private playRecording = (notes: Note[]) => {
    this.player.scheduleNotes(notes);
    this.clock.setCallbacks(
      notes,
      this.player.audioContext.currentTime,
      this.onRecordPlay
    );
  };

  private stopRecording = () => {
    const notes = this.recorder.stopRecording();
    this.playRecording(notes);
  };

  render() {
    const { instrument, loading, activeMidis, playerLoaded } = this.state;

    return (
      playerLoaded && (
        <>
          <Settings
            instrument={instrument}
            onInstrumentChange={id => this.loadPlayer(id)}
            onRecordingStart={this.recorder.startRecording}
            onRecordingEnd={this.stopRecording}
          />
          <div className={pianoWrapperClass}>
            {loading && (
              <Loader className={loaderClass} color={colors.white.base} />
            )}
            <Piano
              noteRange={range}
              onPlayNote={this.player.playNote}
              onStopNote={this.player.stopNote}
              keyboardShortcuts={keyboardShortcuts}
              playbackNotes={activeMidis}
              disabled={loading}
              className={cx(
                {
                  [css({ opacity: 0.2 })]: loading
                },
                piano
              )}
            />
          </div>
        </>
      )
    );
  }
}
