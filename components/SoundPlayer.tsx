import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SoundPlayerProps } from "./typings/SoundPlayer";
import { getMidiRange, isWithinRange, MidiPlayer } from "@utils";
import {
  flexOne,
  loaderClass,
  pianoWrapper,
  toastStyle
} from "@components/styles/SoundPlayer.styles";
import { colors, Loader, Toast } from "@anarock/pebble";
import { getPianoRangeAndShortcuts } from "@utils/keyboard";
import Visualizer from "@components/Visualizer";
import { connect } from "react-redux";
import { Store } from "@typings/store";
import { Piano } from "./Piano";
import { css, cx } from "emotion";
import { Header } from "@components/Header";
import CanvasWorker, {
  CanvasWorkerFallback
} from "@controllers/visualizer.controller";
import {
  getInstrumentById,
  getInstrumentByValue,
  getInstrumentIdByValue,
  instruments
} from "midi-instruments";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import RecordingModal from "@components/RecordingModal";
import webMidi from "webmidi";
import Tone from "tone";
import { PIANO_HEIGHT } from "@config/piano";
import { Track } from "@typings/midi";
import { GlobalHeader } from "@components/GlobalHeader";
import { TrackSelectionInfo } from "@components/TrackList";
import { MidiJSON } from "@utils/midiParser/midiParser";
import { NoteWithIdAndEvent } from "@utils/MidiPlayer/MidiPlayer.utils";

const { range } = getPianoRangeAndShortcuts([38, 88]);

const canvasWorker: CanvasWorkerFallback = new CanvasWorker();

function SoundPlayer({ midiDevice, dispatch }: SoundPlayerProps) {
  const player = useRef(new MidiPlayer(canvasWorker, range));

  const [instrument, setInstrument] = useState(instruments[0].value);
  const [loading, setLoading] = useState(false);
  const [activeMidis, setActiveMidis] = useState([]);
  const [keyboardRange, setKeyboardRange] = useState(range);
  const [isPlaying, setPlaying] = useState(false);
  const [isRecording, setRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState();
  const [mode, setMode] = useState(VISUALIZER_MODE.READ);

  const resetPlayer = useCallback(() => {
    player.current.clear();
    setActiveMidis([]);
  }, []);

  const changeInstrument = useCallback((_instrument = instrument) => {
    (async () => {
      setLoading(true);
      await player.current.loadInstruments({
        instrumentIds: [getInstrumentIdByValue(_instrument)]
      });
      setInstrument(_instrument);
      setLoading(false);
    })();
  }, []);

  const setRange = useCallback(
    notes => {
      // change piano range.
      const requiredRange = getMidiRange(notes);

      if (!isWithinRange(requiredRange, [range.first, range.last])) {
        const _range = getPianoRangeAndShortcuts(requiredRange).range;
        setKeyboardRange(_range);
        setPlaying(true);
        return _range;
      }

      return keyboardRange;
    },
    [keyboardRange]
  );

  const setMidiDevice = useCallback(() => {
    if (midiDevice) {
      const input = webMidi.getInputById(midiDevice);

      if (input) {
        input.addListener("noteon", "all", e => {
          onNoteStart(e.note.number, e.velocity);
        });

        input.addListener("noteoff", "all", e => {
          onNoteStop(e.note.number);
        });
      }
    }
  }, [midiDevice]);

  const preparePlayerForNewTrack = useCallback<(track: Track) => void>(
    track =>
      (async () => {
        const { notes } = track;
        setRange(notes);

        // change instrument if info present in midi.
        if (track.instrument.number) {
          const { value } = getInstrumentById(
            track.instrument.number.toString()
          );
          if (value === instrument) return;

          await changeInstrument(value);
        } else {
          if (instrument === instruments[0].value) return;
          await changeInstrument();
        }
      })(),
    [setRange, instrument]
  );

  const onNoteStart = useCallback(
    (midi, velocity = 1) => {
      player.current.playNote(midi, instrument, velocity);

      setActiveMidis(_activeMidis => _activeMidis.concat(midi));
    },
    [instrument]
  );

  const onNoteStop = useCallback(
    midi => {
      player.current.stopNote(midi, instrument);
      setActiveMidis(_activeMidis =>
        _activeMidis.filter(activeMidi => activeMidi !== midi)
      );
    },
    [instrument]
  );

  const onTogglePlay = useCallback(() => {
    if (Tone.Transport.state === "stopped") {
      // startPlayingTrack(loadedMidi);
    } else {
      player.current.togglePlay();
    }

    setPlaying(!isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    resetPlayer();
    setPlaying(false);
  }, [mode]);

  useEffect(() => {
    changeInstrument();
    setMidiDevice();
  }, []);

  useEffect(() => player.current.setRange(keyboardRange), [keyboardRange]);

  useEffect(resetPlayer, [mode]);

  useEffect(setMidiDevice, [midiDevice]);

  const _instrument = getInstrumentByValue(instrument);

  const onMidiAndTrackSelect = useCallback(
    (midi: MidiJSON, playingInfo: TrackSelectionInfo) => {
      (async () => {
        setMode(VISUALIZER_MODE.READ);
        player.current.clear();
        setActiveMidis([]);

        player.current.setMidi(midi);

        setLoading(true);

        const _range = setRange(
          midi.tracks[playingInfo.selectedTrackIndex].notes
        );
        player.current.setRange(_range);

        await player.current.loadInstruments();
        setLoading(false);

        player.current.scheduleAndPlay(
          playingInfo,
          (notes: NoteWithIdAndEvent[], trackIndex: number) => {
            if (trackIndex === playingInfo.selectedTrackIndex) {
              setActiveMidis(notes.map(note => note.midi));
            }
          }
        );
      })();
    },
    []
  );

  return (
    <>
      <div className={flexOne}>
        <Toast className={toastStyle} />

        <GlobalHeader
          mode={mode}
          onToggleMode={setMode}
          onMidiAndTrackSelect={onMidiAndTrackSelect}
        />

        <Header
          dispatch={dispatch}
          onTogglePlay={onTogglePlay}
          instrument={instrument}
          mode={mode}
          onInstrumentChange={changeInstrument}
          midiDeviceId={midiDevice}
        />

        <RecordingModal
          visible={!isRecording && !!recordedNotes}
          dispatch={dispatch}
          notes={recordedNotes as any}
          instrument={_instrument}
          onActionComplete={() => setRecordedNotes(undefined)}
        />

        <Visualizer
          range={keyboardRange}
          mode={mode}
          canvasWorker={canvasWorker}
        />
      </div>
      <div style={{ height: PIANO_HEIGHT, display: "flex" }}>
        <div className={pianoWrapper}>
          {loading && (
            <Loader className={loaderClass} color={colors.white.base} />
          )}
          <Piano
            activeMidis={activeMidis}
            onPlay={onNoteStart}
            onStop={onNoteStop}
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

export default connect(({ loadedMidi, selectedTrack, midiDevice }: Store) => ({
  loadedMidi,
  selectedTrack,
  midiDevice
}))(SoundPlayer);
