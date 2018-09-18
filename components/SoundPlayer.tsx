import * as React from "react";
import { SoundPlayerState } from "./typings/SoundPlayer";
import Settings from "@components/Settings";
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
import { MIDI, Track } from "midiconvert";
import Visualizer from "@components/Visualizer";
import { EVENT_TYPE } from "@enums/piano";
import { NoteWithEvent } from "@utils/typings/Player";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Store } from "@typings/store";

const { keyboardShortcuts, range } = getPianoRangeAndShortcuts([38, 88]);

interface SoundPlayerProps {
  settings: any;
  dispatch: Dispatch;
  loadedMidi: MIDI;
  selectedTrack: Track;
}

class SoundPlayer extends React.PureComponent<
  SoundPlayerProps,
  SoundPlayerState
> {
  visualizerRef: React.RefObject<Visualizer> = React.createRef();
  player: Player;

  state: SoundPlayerState = {
    instrument: instruments[0],
    loading: false,
    playerLoaded: false,
    activeMidis: undefined,
    keyboardRange: range,
    currentTrack: undefined,
    visualizerMode: VISUALIZER_MODE.WRITE
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

  private preparePlayer = (selectedTrack: Track, cb) => {
    const { notes } = selectedTrack;
    const requiredRange = getMidiRange(notes);
    if (!isWithinRange(requiredRange, [range.first, range.last]))
      this.setState(
        {
          keyboardRange: getPianoRangeAndShortcuts(requiredRange).range
        },
        cb
      );
    else cb();
  };

  componentDidMount() {
    this.player = new Player();
    this.changeInstrument();
  }

  onRecordPlay = ({ midi, event }: NoteWithEvent) => {
    this.setState(prevState => {
      const set = new Set(prevState.activeMidis || []);

      if (event === EVENT_TYPE.NOTE_START) {
        return { activeMidis: [...set.add(midi)] };
      } else if (event === EVENT_TYPE.NOTE_STOP) {
        set.delete(midi);
        return { activeMidis: [...set] };
      } else if (event === EVENT_TYPE.PLAYING_COMPLETE) {
        this.setState(
          {
            visualizerMode: VISUALIZER_MODE.WRITE
          },
          () => {
            this.visualizerRef.current.stop();
            return { activeMidis: undefined };
          }
        );
      }
    });
  };

  private stopRecording = () => {
    this.player.stopRecording();
    this.player.playRecording(this.onRecordPlay);
  };

  private renderNoteLabel = ({ midiNumber, isAccidental }) => {
    const noteName = Tone.Frequency(midiNumber, "midi").toNote();
    return !isAccidental && noteName.startsWith("C") && noteName;
  };

  private onNoteStart = midi => {
    this.visualizerRef.current.addNote(midi);
    this.player.startNote(midi);
  };

  private onNoteStop = midi => {
    this.visualizerRef.current.stopNote(midi);
    this.player.stopNote(midi);
  };

  componentDidUpdate(prevProps: SoundPlayerProps) {
    const { loadedMidi, selectedTrack } = this.props;

    if (selectedTrack !== prevProps.selectedTrack && selectedTrack) {
      this.resetPlayer();

      this.preparePlayer(selectedTrack, () => {
        this.setState(
          {
            visualizerMode: VISUALIZER_MODE.READ
          },
          () => {
            this.visualizerRef.current.start(
              selectedTrack,
              this.state.keyboardRange
            );
            this.player.playMidi(selectedTrack, loadedMidi, this.onRecordPlay);
          }
        );
      });
    }
  }

  render() {
    const {
      instrument,
      loading,
      activeMidis,
      playerLoaded,
      keyboardRange,
      visualizerMode
    } = this.state;

    return (
      <>
        <Visualizer
          ref={this.visualizerRef}
          range={keyboardRange}
          mode={visualizerMode}
        />
        <div style={{ height: 300 }}>
          {playerLoaded && (
            <>
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
                  onPlayNote={this.onNoteStart}
                  onStopNote={this.onNoteStop}
                  keyboardShortcuts={keyboardShortcuts}
                  playbackNotes={activeMidis}
                  disabled={loading || visualizerMode === VISUALIZER_MODE.READ}
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
          )}
        </div>
      </>
    );
  }
}

export default connect(({ settings, loadedMidi, selectedTrack }: Store) => ({
  settings,
  loadedMidi,
  selectedTrack
}))(SoundPlayer);
