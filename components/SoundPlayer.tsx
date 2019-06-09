import * as React from "react";
import { SoundPlayerProps, SoundPlayerState } from "./typings/SoundPlayer";
import { getMidiRange, isWithinRange, Player } from "@utils";
import {
  flexOne,
  loaderClass,
  pianoWrapper,
  toastStyle
} from "@components/styles/SoundPlayer.styles";
import { colors, Loader, Toast } from "@anarock/pebble";
import { getPianoRangeAndShortcuts } from "@utils/keyboard";
import { MIDI, Track } from "midiconvert";
import Visualizer from "@components/Visualizer";
import { NoteWithEvent } from "@utils/typings/Player";
import { connect } from "react-redux";
import { Store } from "@typings/store";
import { Piano } from "./Piano";
import { css, cx } from "emotion";
import Header from "@components/Header";
import CanvasWorker, {
  CanvasWorkerFallback
} from "@controllers/visualizer.controller";
import {
  getInstrumentById,
  getInstrumentNames,
  instruments
} from "midi-instruments";
import PlayerController from "@components/PlayerController";
import { ReducersType } from "@enums/reducers";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import RecordingModal from "@components/RecordingModal";
import webMidi from "webmidi";
import Tone from "tone";
import dynamic from "next/dynamic";
import { RecordingsSidebarProps } from "@components/typings/RecordingSidebar";

const { range } = getPianoRangeAndShortcuts([38, 88]);

const RecordingsSidebar = dynamic<RecordingsSidebarProps>(
  (() => import("@components/RecordingsSidebar")) as any,
  {
    ssr: false,
    loading: () => null
  }
);

const canvasWorker: CanvasWorkerFallback = new CanvasWorker();

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
    isPlaying: false,
    isRecording: false,
    recordedNotes: undefined,
    showSidebar: false
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

  private setRange = notes => {
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

  componentDidUpdate(prevProps: Readonly<SoundPlayerProps>): void {
    // reset player if mode changes.
    if (prevProps.settings.mode !== this.props.settings.mode) {
      this.resetPlayer();
    }

    if (prevProps.midiDevice !== this.props.midiDevice) {
      this.setMidiDevice();
    }
  }

  private preparePlayerForNewTrack = async (
    selectedTrack: Track = this.props.selectedTrack
  ) => {
    const { notes } = selectedTrack;
    this.setRange(notes);

    // change instrument if info present in midi.
    if (selectedTrack.instrumentNumber) {
      const { value } = getInstrumentById(selectedTrack.instrumentNumber);
      if (value === this.state.instrument) return;

      await this.changeInstrument(value);
    } else {
      if (this.state.instrument === instruments[0].value) return;
      await this.changeInstrument();
    }
  };

  componentDidMount() {
    this.changeInstrument();
    this.setMidiDevice();
  }

  setMidiDevice = () => {
    if (this.props.midiDevice) {
      const input = webMidi.getInputById(this.props.midiDevice);

      if (input) {
        input.addListener("noteon", "all", e => {
          this.onNoteStart(e.note.number, e.velocity);
        });

        input.addListener("noteoff", "all", e => {
          this.onNoteStop(e.note.number);
        });
      }
    }
  };

  onRecordPlay = (notesPlaying: NoteWithEvent[], isComplete) => {
    if (isComplete) {
      this.player.stopTrack();
      this.setState({
        activeMidis: [],
        isPlaying: false
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

  private onNoteStart = (midi, velocity = 1) => {
    this.player.playNote(midi, velocity);
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

  private onTogglePlay = () => {
    if (Tone.Transport.state === "stopped") {
      this.startPlayingTrack();
    } else {
      this.player.togglePlay();
    }

    this.setState({
      isPlaying: !this.state.isPlaying
    });
  };

  private selectTrack = (midi: MIDI, i: number) => {
    const track = midi.tracks[i];

    this.props.dispatch({
      type: ReducersType.CHANGE_SETTINGS,
      payload: {
        mode: VISUALIZER_MODE.READ
      }
    });

    this.props.dispatch({
      type: ReducersType.LOADED_MIDI,
      payload: midi
    });
    this.props.dispatch({
      type: ReducersType.SET_SELECTED_TRACK,
      payload: track
    });

    this.resetPlayer();
    this.preparePlayerForNewTrack(track);
  };

  private startPlayingTrack = async (track = this.props.selectedTrack) => {
    this.setState({
      activeMidis: []
    });

    // in case the sound-fonts are not yet loaded.
    await this.preparePlayerForNewTrack(track);

    this.player.playTrack(this.props.loadedMidi, track, this.onRecordPlay);
  };

  private toggleRecording = () => {
    this.setState({
      isRecording: !this.state.isRecording,
      recordedNotes: this.player.toggleRecording()
    });
  };

  private toggleMode = (mode: VISUALIZER_MODE) => {
    this.resetPlayer();
    this.props.dispatch({
      type: ReducersType.CHANGE_SETTINGS,
      payload: {
        mode
      }
    });
    this.setState({
      isPlaying: false
    });
  };

  private toggleSidebar = () => {
    this.setState({
      showSidebar: !this.state.showSidebar
    });
  };

  render() {
    const {
      instrument,
      loading,
      activeMidis,
      keyboardRange,
      isPlaying,
      isRecording,
      recordedNotes,
      showSidebar
    } = this.state;

    const {
      settings: { mode },
      isCounterRunning,
      dispatch,
      recordings,
      midiDevice,
      midiHistory
    } = this.props;

    return (
      <>
        <div className={flexOne}>
          <Toast className={toastStyle} />

          <RecordingsSidebar
            visible={showSidebar}
            onClose={this.toggleSidebar}
            midis={midiHistory.concat(recordings)}
            dispatch={dispatch}
            onCounterComplete={this.startPlayingTrack}
            onTrackSelect={(midi, i) => {
              debugger;
              this.selectTrack(midi, i);
              this.preparePlayerForNewTrack(midi.tracks[i]);
            }}
          />

          <Header
            dispatch={dispatch}
            onTogglePlay={this.onTogglePlay}
            instrument={instrument}
            mode={mode}
            onInstrumentChange={this.changeInstrument}
            isRecording={isRecording}
            toggleRecording={this.toggleRecording}
            recordings={recordings}
            onToggleMode={this.toggleMode}
            midiDeviceId={midiDevice}
            onToggleSidebar={this.toggleSidebar}
          />

          <RecordingModal
            visible={!isRecording && !!recordedNotes}
            dispatch={dispatch}
            notes={recordedNotes as any}
            instrumentId={getInstrumentNames().findIndex(
              _instrument => _instrument === instrument
            )}
            onActionComplete={() =>
              this.setState({
                recordedNotes: undefined
              })
            }
          />

          {mode === VISUALIZER_MODE.READ && (
            <PlayerController
              onTogglePlay={this.onTogglePlay}
              isPlaying={isPlaying}
              midi={this.props.loadedMidi}
              onTrackSelect={this.selectTrack}
              onStartPlay={this.startPlayingTrack}
              onToggleSidebar={this.toggleSidebar}
              dispatch={dispatch}
              isCounterRunning={isCounterRunning}
            />
          )}

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

export default connect(
  ({
    settings,
    loadedMidi,
    selectedTrack,
    recordings,
    midiDevice,
    midiHistory,
    uiState
  }: Store) => ({
    settings,
    loadedMidi,
    selectedTrack,
    recordings,
    midiDevice,
    midiHistory,
    isCounterRunning: uiState.isCounterRunning
  })
)(SoundPlayer);
