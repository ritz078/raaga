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
import {EVENT_TYPE} from "@enums/piano";
import {NoteWithEvent} from "@utils/typings/Player";

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

      this.preparePlayer(midi, 2, () => {
        this.visualizerRef.current.play(midi.tracks[2], this.state.keyboardRange)
        this.player.playMidi(2, midi, this.onRecordPlay);
        this.setState({
          currentTrack: midi.tracks[2]
        });
      });
    };
  }

  onRecordPlay = ({midi, event}: NoteWithEvent) => {
  	this.setState(prevState => {
      const set = new Set(prevState.activeMidis || []);

      if (event === EVENT_TYPE.NOTE_START) {
        return { activeMidis: [...set.add(midi)] };
      } else if (event === EVENT_TYPE.NOTE_STOP) {
        set.delete(midi);
        return { activeMidis: [...set] };
      } else if (event === EVENT_TYPE.PLAYING_COMPLETE) {
      	this.visualizerRef.current.stop();
        return { activeMidis: undefined };
      }
    });
  };

  private stopRecording = () => {
    this.player.stopRecording();
    this.player.playRecording(this.onRecordPlay);
  };

  private loadMidiFile = e => {
  	console.log(e)
  	e.preventDefault();
    const file = e.target.files[0];
    worker.postMessage(file);
  };

  private renderNoteLabel = ({ midiNumber }) =>
    null && Tone.Frequency(midiNumber, "midi").toNote();

  render() {
    const { instrument, loading, activeMidis, playerLoaded, keyboardRange } = this.state;

    return (
      <>
				<Visualizer ref={this.visualizerRef} range={keyboardRange} />
				<div>
        {playerLoaded && (
          <>
            <input
              style={{ position: "absolute" }}
              type="file"
              onChange={this.loadMidiFile}
							accept=".mid"
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
				</div>
      </>
    );
  }
}
