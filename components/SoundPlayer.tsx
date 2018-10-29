import * as React from "react";
import { SoundPlayerProps, SoundPlayerState } from "./typings/SoundPlayer";
import { getMidiRange, isWithinRange, Player } from "@utils";
import {
  flexOne,
  loaderClass,
  pianoWrapper
} from "@components/styles/SoundPlayer.styles";
import { colors, Loader } from "@anarock/pebble";
import { getPianoRangeAndShortcuts } from "@config/piano";
import { Track } from "midiconvert";
import Visualizer from "@components/Visualizer";
import { NoteWithEvent, CanvasWorkerInterface } from "@utils/typings/Player";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import { connect } from "react-redux";
import { Store } from "@typings/store";
import { Piano } from "./Piano";
import { css, cx } from "emotion";
import Header from "@components/Header";
import CanvasWorker from "@workers/canvas.worker";
import { getInstrumentById, instruments } from "midi-instruments";

const { range } = getPianoRangeAndShortcuts([38, 88]);

const canvasWorker: CanvasWorkerInterface = new CanvasWorker();

class SoundPlayer extends React.PureComponent<
  SoundPlayerProps,
  SoundPlayerState
> {
  player = new Player({
    canvasWorker,
    range
  });

  state: SoundPlayerState = {
    instrument: instruments[0].value,
    loading: false,
    activeMidis: [],
    keyboardRange: range,
    mode: VISUALIZER_MODE.WRITE,
    isPlaying: false
  };

  private resetPlayer = () => {
    this.player.clear();
    this.setState({
      activeMidis: []
    });
  };

  private changeInstrument = async (instrument = this.state.instrument) => {
    this.setState({ loading: true });
    await this.player.loadSoundFont(instrument);
    this.setState({
      instrument,
      loading: false
    });
  };

  private preparePlayerForNewTrack = async (selectedTrack: Track) => {
    const { notes } = selectedTrack;

    // change instrument if info present in midi.
    if (selectedTrack.instrumentNumber) {
      const instrument = getInstrumentById(selectedTrack.instrumentNumber);
      await this.changeInstrument(instrument.value);
    } else {
      await this.changeInstrument();
    }

    // change piano range.
    const requiredRange = getMidiRange(notes);
    if (!isWithinRange(requiredRange, [range.first, range.last])) {
      this.setState(
        {
          keyboardRange: getPianoRangeAndShortcuts(requiredRange).range,
          isPlaying: true
        },
        () => {
          this.player.setRange(this.state.keyboardRange);
        }
      );
    }
  };

  componentDidMount() {
    this.changeInstrument();
  }

  onRecordPlay = (notesPlaying: NoteWithEvent[], isComplete) => {
    if (isComplete) {
      this.player.stopTrack();
      this.setState({
        mode: VISUALIZER_MODE.WRITE,
        activeMidis: []
      });
    } else {
      this.setState({
        activeMidis: notesPlaying.map(note => note.midi)
      });
    }
  };

  // private stopRecording = () => {
  //   this.player.stopRecording();
  //   this.player.playRecording(this.props.selectedTrack, this.onRecordPlay);
  // };

  private onNoteStart = midi => {
    this.player.playNote(midi);
    this.setState(state => ({
      activeMidis: state.activeMidis.concat(midi)
    }));
  };

  private onNoteStop = midi => {
    this.player.stopNote(midi);
    this.setState(state => ({
      activeMidis: state.activeMidis.filter(activeMidi => activeMidi !== midi)
    }));
  };

  async componentDidUpdate(prevProps: SoundPlayerProps) {
    const { loadedMidi, selectedTrack } = this.props;

    if (selectedTrack !== prevProps.selectedTrack && selectedTrack) {
      this.resetPlayer();
      await this.preparePlayerForNewTrack(selectedTrack);

      this.setState(
        {
          mode: VISUALIZER_MODE.READ
        },
        () => {
          this.player.playTrack(loadedMidi, selectedTrack, this.onRecordPlay);
        }
      );
    }
  }

  private onTogglePlay = () => {
    this.player.toggle();

    this.setState({
      isPlaying: !this.state.isPlaying
    });
  };

  render() {
    const {
      instrument,
      loading,
      activeMidis,
      keyboardRange,
      mode,
      isPlaying
    } = this.state;

    return (
      <>
        <div className={flexOne}>
          <Header
            onTogglePlay={this.onTogglePlay}
            isPlaying={isPlaying}
            instrument={instrument}
            mode={mode}
          />
          <Visualizer
            range={keyboardRange}
            mode={mode}
            canvasWorker={canvasWorker}
          />
        </div>
        <div style={{ height: 300 }}>
          <div className={pianoWrapper}>
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
