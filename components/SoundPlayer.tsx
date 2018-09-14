import * as React from "react";
import { SoundPlayerState } from "./typings/SoundPlayer";
import Settings from "@components/Settings";
import { EVENT_TYPE, EventArgs } from "@utils/typings/Clock";
import { getMidiRange, isWithinRange, Player } from "@utils";
import {
  loaderClass,
  piano,
  pianoWrapperClass,
  visualizerWrapper
} from "@components/styles/SoundPlayer.styles";
import { colors, Loader } from "@anarock/pebble";
import { css, cx } from "emotion";
import { Piano } from "react-piano";
import { getPianoRangeAndShortcuts } from "@config/piano";
import instruments from "soundfont-player/instruments.json";
import Tone from "tone";
import MidiLoadWorker from "@workers/midiload.worker";
import CanvasWorker from "@workers/canvas.worker";
import { MIDI } from "midiconvert";

const { keyboardShortcuts, range } = getPianoRangeAndShortcuts([38, 88]);

const worker: Worker = new MidiLoadWorker();
const canvasWorker: Worker = new CanvasWorker();

export default class SoundPlayer extends React.PureComponent<
  {},
  SoundPlayerState
> {
  canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();
  player: Player;

  state: SoundPlayerState = {
    instrument: instruments[0],
    loading: false,
    playerLoaded: false,
    activeMidis: undefined,
    keyboardRange: range,
    currentTrack: undefined
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

  private onProgressChange = () => {
    // this.setState({
    // 	currentTrackProgress: progress
    // })
  };

  async componentDidMount() {
    this.player = new Player();
    this.changeInstrument();

    // @ts-ignore
    const offscreen = this.canvasRef.current.transferControlToOffscreen();

    canvasWorker.postMessage(
      {
        canvas: offscreen,
        message: "init"
      },
      [offscreen]
    );

    worker.onmessage = e => {
      this.resetPlayer();
      const midi: MIDI = e.data;

      this.preparePlayer(midi, 0, () => {
        canvasWorker.postMessage({
          track: midi.tracks[0],
          range: this.state.keyboardRange
        });
        this.player.playMidi(0, midi, this.onRecordPlay, this.onProgressChange);
        this.setState({
          currentTrack: midi.tracks[0]
        });
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
    this.player.playRecording(this.onRecordPlay, this.onProgressChange);
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
      <>
        <div className={visualizerWrapper}>
          <canvas
            width={1620}
            height={400}
            style={{ height: 400 }}
            ref={this.canvasRef}
          />
        </div>
        {playerLoaded && (
          <>
            <input
              style={{ position: "absolute" }}
              type="file"
              onChange={this.loadMidiFile}
            />
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
        )}
      </>
    );
  }
}
