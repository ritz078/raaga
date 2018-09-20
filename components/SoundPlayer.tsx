import * as React from "react";
import { SoundPlayerState } from "./typings/SoundPlayer";
import { getMidiRange, isWithinRange, Player } from "@utils";
import {
  loaderClass,
  pianoWrapperClass
} from "@components/styles/SoundPlayer.styles";
import { colors, Loader } from "@anarock/pebble";
import { getPianoRangeAndShortcuts } from "@config/piano";
import instruments from "soundfont-player/instruments.json";
import { MIDI, Track } from "midiconvert";
import Visualizer from "@components/Visualizer";
import { EVENT_TYPE } from "@enums/piano";
import { NoteWithEvent } from "@utils/typings/Player";
import {
  VISUALIZER_MESSAGES,
  VISUALIZER_MODE
} from "@enums/visualizerMessages";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Store } from "@typings/store";
import { Piano } from "./Piano";
import { css, cx } from "emotion";
import Header from "@components/Header";
import CanvasWorker from "@workers/canvas.worker";

const { range } = getPianoRangeAndShortcuts([38, 88]);

const canvasWorker: Worker = new CanvasWorker();

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
    activeMidis: [],
    keyboardRange: range,
    currentTrack: undefined,
    visualizerMode: VISUALIZER_MODE.WRITE,
    isPlaying: false
  };

  private resetPlayer = () => {
    this.player.reset();
    this.setState({
      activeMidis: []
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
          keyboardRange: getPianoRangeAndShortcuts(requiredRange).range,
          isPlaying: true
        },
        cb
      );
    else cb();
  };

  componentDidMount() {
    this.player = new Player();
    this.changeInstrument();
  }

  onRecordPlay = ({ midi, event }: Partial<NoteWithEvent>) => {
    if (event === EVENT_TYPE.PLAYING_COMPLETE) {
      this.visualizerRef.current.stop();
    }

    // @ts-ignore
    this.setState(state => {
      if (event === EVENT_TYPE.NOTE_START) {
        return { activeMidis: state.activeMidis.concat(midi) };
      } else if (event === EVENT_TYPE.NOTE_STOP) {
        const activeMidis = state.activeMidis.filter(_midi => _midi !== midi);
        return {
          activeMidis
        };
      } else if (event === EVENT_TYPE.PLAYING_COMPLETE) {
        return {
          visualizerMode: VISUALIZER_MODE.WRITE,
          activeMidis: []
        };
      }
    });
  };

  private stopRecording = () => {
    this.player.stopRecording();
    this.player.playRecording(this.props.selectedTrack, this.onRecordPlay);
  };

  private onNoteStart = midi => {
    this.visualizerRef.current.addNote(midi);
    this.player.startNote(midi);
    this.onRecordPlay({ midi, event: EVENT_TYPE.NOTE_START });
  };

  private onNoteStop = midi => {
    this.visualizerRef.current.stopNote(midi);
    this.onRecordPlay({ midi, event: EVENT_TYPE.NOTE_STOP });
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

  private onTogglePlay = () => {
    // toggle visualizer
    canvasWorker.postMessage({
      message: VISUALIZER_MESSAGES.TOGGLE
    });

    // toggle sound player
    this.player.toggle();

    // toggle state for UI
    this.setState({
      isPlaying: !this.state.isPlaying
    });
  };

  render() {
    const {
      instrument,
      loading,
      activeMidis,
      playerLoaded,
      keyboardRange,
      visualizerMode,
      isPlaying
    } = this.state;

    return (
      <>
        <div style={{ display: "flex", flex: 1 }}>
          <Header
            onTogglePlay={this.onTogglePlay}
            isPlaying={isPlaying}
            instrument={instrument}
            mode={visualizerMode}
          />
          <Visualizer
            ref={this.visualizerRef}
            range={keyboardRange}
            mode={visualizerMode}
            canvasWorker={canvasWorker}
          />
        </div>
        <div style={{ height: 300 }}>
          {playerLoaded && (
            <div
              className={cx(
                pianoWrapperClass,
                css({
                  alignItems: "center"
                })
              )}
            >
              {loading && (
                <Loader className={loaderClass} color={colors.white.base} />
              )}
              <Piano
                activeMidis={activeMidis}
                onPlay={this.onNoteStart}
                onStop={this.onNoteStop}
                min={keyboardRange.first}
                max={keyboardRange.last}
                className={cx({
                  [css({ opacity: 0.2 })]: loading
                })}
              />
            </div>
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
