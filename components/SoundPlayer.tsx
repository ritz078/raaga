import * as React from "react";
import { SoundPlayerProps } from "./typings/SoundPlayer";
import { getMidiRange, isWithinRange, Player } from "@utils";
import {
  flexOne,
  loaderClass,
  pianoWrapper,
  toastStyle
} from "@components/styles/SoundPlayer.styles";
import { colors, Loader, Toast } from "@anarock/pebble";
import { getPianoRangeAndShortcuts } from "@utils/keyboard";
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
  getInstrumentByValue,
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
import { PIANO_HEIGHT } from "@config/piano";
import { Midi, Track } from "@typings/midi";
import { useCallback, useEffect, useRef, useState } from "react";

const { range } = getPianoRangeAndShortcuts([38, 88]);

const RecordingsSidebar = dynamic<RecordingsSidebarProps>(
  (() => import("@components/RecordingsSidebar")) as any,
  {
    ssr: false,
    loading: () => null
  }
);

const canvasWorker: CanvasWorkerFallback = new CanvasWorker();

function SoundPlayer({
  settings,
  midiDevice,
  dispatch,
  loadedMidi,
  midiHistory,
  recordings,
  selectedTrack
}: SoundPlayerProps) {
  const player = useRef(new Player({ canvasWorker, range }));

  const [instrument, setInstrument] = useState(instruments[0].value);
  const [loading, setLoading] = useState(false);
  const [activeMidis, setActiveMidis] = useState([]);
  const [keyboardRange, setKeyboardRange] = useState(range);
  const [isPlaying, setPlaying] = useState(false);
  const [isRecording, setRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState();
  const [showSidebar, toggleSidebar] = useState(false);

  const resetPlayer = useCallback(() => {
    player.current.clear();
    setActiveMidis([]);
  }, []);

  const changeInstrument = useCallback(
    (_instrument = instrument) => {
      (async () => {
        setLoading(true);
        await player.current.loadSoundFont(_instrument);
        setInstrument(_instrument);
        setLoading(false);
      })();
    },
    [player]
  );

  const setRange = useCallback(notes => {
    // change piano range.
    const requiredRange = getMidiRange(notes);

    if (!isWithinRange(requiredRange, [range.first, range.last])) {
      setKeyboardRange(getPianoRangeAndShortcuts(requiredRange).range);
      setPlaying(true);
    }
  }, []);

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

  const onRecordPlay = useCallback(
    (notesPlaying: NoteWithEvent[], isComplete: boolean) => {
      if (isComplete) {
        player.current.stopTrack();
        setActiveMidis([]);
        setPlaying(false);
      } else {
        setActiveMidis(notesPlaying.map(note => note.midi));
      }
    },
    [player]
  );

  const onNoteStart = useCallback(
    (midi, velocity = 1) => {
      player.current.playNote(midi, velocity);

      setActiveMidis(_activeMidis => _activeMidis.concat(midi));
    },
    [activeMidis]
  );

  const onNoteStop = useCallback(
    midi => {
      player.current.stopNote(midi);
      setActiveMidis(_activeMidis =>
        _activeMidis.filter(activeMidi => activeMidi !== midi)
      );
    },
    [player, activeMidis]
  );

  const onTogglePlay = useCallback(() => {
    if (Tone.Transport.state === "stopped") {
      startPlayingTrack(loadedMidi);
    } else {
      player.current.togglePlay();
    }

    setPlaying(!isPlaying);
  }, [isPlaying]);

  const selectTrack = useCallback((midi: Midi, i: number) => {
    const track = midi.tracks[i];

    dispatch({
      type: ReducersType.CHANGE_SETTINGS,
      payload: {
        mode: VISUALIZER_MODE.READ
      }
    });

    dispatch({
      type: ReducersType.LOADED_MIDI,
      payload: midi
    });

    dispatch({
      type: ReducersType.SET_SELECTED_TRACK,
      payload: track
    });

    resetPlayer();
    preparePlayerForNewTrack(track);
  }, []);

  const startPlayingTrack = async (
    midi: Midi = loadedMidi,
    track = selectedTrack
  ) => {
    setActiveMidis([]);

    // in case the sound-fonts are not yet loaded.
    await preparePlayerForNewTrack(track);

    player.current.playTrack(midi, track, onRecordPlay);
  };

  const setTrackAndPlay = (midi: Midi, i: number) => {
    const track = midi.tracks[i];

    selectTrack(midi, i);
    startPlayingTrack(midi, track);
  };

  const toggleRecording = () => {
    setRecording(!isRecording);
    setRecordedNotes(player.current.toggleRecording());
  };

  useEffect(() => {
    resetPlayer();
    setPlaying(false);
  }, [settings.mode]);

  useEffect(() => {
    changeInstrument();
    setMidiDevice();
  }, []);

  useEffect(() => player.current.setRange(keyboardRange), [keyboardRange]);

  useEffect(resetPlayer, [settings.mode]);

  useEffect(setMidiDevice, [midiDevice]);

  const _instrument = getInstrumentByValue(instrument);

  return (
    <>
      <div className={flexOne}>
        <Toast className={toastStyle} />

        <RecordingsSidebar
          visible={showSidebar}
          onClose={() => toggleSidebar(!showSidebar)}
          midis={midiHistory.concat(recordings)}
          dispatch={dispatch}
          onTrackSelect={setTrackAndPlay}
        />

        <Header
          dispatch={dispatch}
          onTogglePlay={onTogglePlay}
          instrument={instrument}
          mode={settings.mode}
          onInstrumentChange={changeInstrument}
          isRecording={isRecording}
          toggleRecording={toggleRecording}
          recordings={recordings}
          midiDeviceId={midiDevice}
          onToggleSidebar={() => toggleSidebar(!showSidebar)}
        />

        <RecordingModal
          visible={!isRecording && !!recordedNotes}
          dispatch={dispatch}
          notes={recordedNotes as any}
          instrument={_instrument}
          onActionComplete={() => setRecordedNotes(undefined)}
        />

        {settings.mode === VISUALIZER_MODE.READ && (
          <PlayerController
            onTogglePlay={onTogglePlay}
            isPlaying={isPlaying}
            midi={loadedMidi}
            onTrackSelect={setTrackAndPlay}
            onToggleSidebar={() => toggleSidebar(!showSidebar)}
            onStartPlay={() => startPlayingTrack(loadedMidi)}
          />
        )}

        <Visualizer
          range={keyboardRange}
          mode={settings.mode}
          canvasWorker={canvasWorker}
        />
      </div>
      <div style={{ height: PIANO_HEIGHT }}>
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

export default connect(
  ({
    settings,
    loadedMidi,
    selectedTrack,
    recordings,
    midiDevice,
    midiHistory
  }: Store) => ({
    settings,
    loadedMidi,
    selectedTrack,
    recordings,
    midiDevice,
    midiHistory
  })
)(SoundPlayer);
