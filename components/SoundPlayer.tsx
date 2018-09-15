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
import MidiLoadWorker from "@workers/midiload.worker";
import { MIDI } from "midiconvert";
import Visualizer from "@components/Visualizer";
import { EVENT_TYPE } from "@enums/piano";
import { NoteWithEvent } from "@utils/typings/Player";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";

const { keyboardShortcuts, range } = getPianoRangeAndShortcuts([38, 88]);

const worker: Worker = new MidiLoadWorker();

export default class SoundPlayer extends React.PureComponent<
  {},
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

  private preparePlayer = (midi, trackIndex = 0, cb) => {
    const { notes } = midi.tracks[trackIndex];
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

  async componentDidMount() {
    this.player = new Player();
    this.changeInstrument();

    worker.onmessage = e => {
      this.resetPlayer();
      const midi: MIDI = e.data;

      const trackIndex = 1;

      this.preparePlayer(midi, trackIndex, () => {
        this.setState(
          {
            visualizerMode: VISUALIZER_MODE.READ
          },
          () => {
            this.visualizerRef.current.start(
              midi.tracks[trackIndex],
              this.state.keyboardRange
            );
            this.player.playMidi(trackIndex, midi, this.onRecordPlay);
            this.setState({
              currentTrack: midi.tracks[trackIndex]
            });
          }
        );
      });
    };
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

  private loadMidiFile = e => {
    const file = e.target.files[0];
    worker.postMessage(file);
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
        <input type="file" onChange={this.loadMidiFile} accept=".mid" />
        <Visualizer
          ref={this.visualizerRef}
          range={keyboardRange}
          mode={visualizerMode}
        />
        <div>
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
          )}
        </div>
      </>
    );
  }
}
