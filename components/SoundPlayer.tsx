import * as React from "react";
import { SoundPlayerState } from "./typings/SoundPlayer";
import Settings from "@components/Settings";
import { EVENT_TYPE, EventArgs } from "@utils/typings/Clock";
import { getMidiRange, isWithinRange, Player } from "@utils";
import {
  loaderClass,
  piano,
  pianoWrapperClass
} from "@components/styles/SoundPlayer.styles";
import { colors, Loader } from "@anarock/pebble";
import { css, cx } from "emotion";
import { Piano } from "react-piano";
import { getPianoRangeAndShortcuts } from "@config/piano";
import instruments from "soundfont-player/instruments.json";
import Tone from "tone";
import MidiLoadWorker from "@workers/midiload.worker";

const { keyboardShortcuts, range } = getPianoRangeAndShortcuts([38, 88]);

const worker = new MidiLoadWorker();

export default class SoundPlayer extends React.PureComponent<
  {},
  SoundPlayerState
> {
  player: Player;

  state: SoundPlayerState = {
    instrument: instruments[0],
    loading: false,
    playerLoaded: false,
    activeMidis: undefined,
    keyboardRange: range
  };

  private resetPlayer = () => {
    this.player.reset();
    this.setState({
      activeMidis: undefined
    });
  };

  private changeInstrument = async (instrument = this.state.instrument) => {
    this.setState({ loading: true });

    await this.player.loadSound(instrument);

    this.setState({
      playerLoaded: true,
      instrument,
      loading: false
    });
  };

  private preparePlayer = (midi, trackIndex = 0, cb) => {
    const { notes } = midi.tracks[trackIndex];
    const requiredRange = getMidiRange(notes);
    const currentRange = [
      this.state.keyboardRange.first,
      this.state.keyboardRange.last
    ];
    if (!isWithinRange(requiredRange, currentRange))
      this.setState(
        {
          keyboardRange: getPianoRangeAndShortcuts(requiredRange).range
        },
        cb
      );
    else cb();
  };

  async componentDidMount() {
    this.player = new Player();
    this.changeInstrument();

    worker.onmessage = e => {
      this.resetPlayer();
      const midi = e.data;
      this.preparePlayer(midi, 1, () => {
        this.player.playMidi(1, midi, this.onRecordPlay);
      });
    };
  }

  onRecordPlay = (e: { args: EventArgs }) => {
    const { eventType, midi } = e.args;

    this.setState(prevState => {
      const set = new Set(prevState.activeMidis || []);

      if (eventType === EVENT_TYPE.NOTE_START) {
        return { activeMidis: [...set.add(midi)] };
      } else if (eventType === EVENT_TYPE.NOTE_STOP) {
        set.delete(midi);
        return { activeMidis: [...set] };
      } else if (eventType === EVENT_TYPE.PLAYING_COMPLETE) {
        return { activeMidis: undefined };
      }
    });
  };

  private stopRecording = () => {
    this.player.stopRecording();
    this.player.playRecording(this.onRecordPlay);
  };

  private loadMidiFile = async e => {
    const file = e.target.files[0];
    worker.postMessage(file);
  };

  private renderNoteLabel = ({ midiNumber }) =>
    null && Tone.Frequency(midiNumber, "midi").toNote();

  render() {
    const { instrument, loading, activeMidis, playerLoaded } = this.state;

    return (
      playerLoaded && (
        <>
          <input type="file" onChange={this.loadMidiFile} />
          <Settings
            instrument={instrument}
            onInstrumentChange={this.changeInstrument}
            onRecordingStart={this.player.startRecording}
            onRecordingEnd={this.stopRecording}
          />
          <div className={pianoWrapperClass}>
            {loading && (
              <Loader className={loaderClass} color={colors.white.base} />
            )}
            <Piano
              noteRange={this.state.keyboardRange}
              onPlayNote={this.player.startNote}
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
              renderNoteLabel={this.renderNoteLabel}
            />
          </div>
        </>
      )
    );
  }
}
