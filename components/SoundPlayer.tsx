import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SoundPlayerProps } from "./typings/SoundPlayer";
import {
  getMidiRange,
  IScheduleOptions,
  isWithinRange,
  MidiPlayer
} from "@utils";
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
import { Header } from "@components/Header";
import CanvasWorker, {
  CanvasWorkerFallback
} from "@controllers/visualizer.controller";
import {
  getInstrumentByValue,
  getInstrumentIdByValue,
  instruments
} from "midi-instruments";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import RecordingModal from "@components/RecordingModal";
import webMidi from "webmidi";
import Tone from "tone";
import { PIANO_HEIGHT } from "@config/piano";
import { IMidiJSON } from "@typings/midi";
import { GlobalHeader } from "@components/GlobalHeader";
import { TrackSelectionInfo } from "@components/TrackList";
import { NoteWithIdAndEvent } from "@utils/MidiPlayer/MidiPlayer.utils";
import { Range } from "@utils/typings/Visualizer";

const { range } = getPianoRangeAndShortcuts([38, 88]);

const canvasWorker: CanvasWorkerFallback = new CanvasWorker();
const player = new MidiPlayer(canvasWorker, range);
export const PlayerContext = React.createContext(player);

function SoundPlayer({ midiDevice, dispatch }: SoundPlayerProps) {
  const [instrument, setInstrument] = useState(instruments[0].value);
  const [loading, setLoading] = useState(false);
  const [activeMidis, setActiveMidis] = useState<number[]>([]);
  const [keyboardRange, setKeyboardRange] = useState<Range>(range);
  const [isPlaying, setPlaying] = useState(false);
  const [isRecording, setRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState();
  const [mode, setMode] = useState<VISUALIZER_MODE>(VISUALIZER_MODE.READ);
  const [playingMidiInfo, setPlayingMidiInfo] = useState<IScheduleOptions>();
  const [loadedMidi, setMidi] = useState<IMidiJSON>();

  const resetPlayer = useCallback(() => {
    player.clear();
    setActiveMidis([]);
  }, []);

  const changeInstrument = useCallback((_instrument = instrument) => {
    (async () => {
      setLoading(true);
      await player.loadInstruments({
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

  const onNoteStart = useCallback(
    (midi, velocity = 1) => {
      player.playNote(midi, instrument, velocity);

      setActiveMidis(_activeMidis => _activeMidis.concat(midi));
    },
    [instrument]
  );

  const onNoteStop = useCallback(
    midi => {
      player.stopNote(midi, instrument);
      setActiveMidis(_activeMidis =>
        _activeMidis.filter(activeMidi => activeMidi !== midi)
      );
    },
    [instrument]
  );

  const onMidiAndTrackSelect = useCallback(
    (midi: IMidiJSON, playingInfo: TrackSelectionInfo) => {
      (async () => {
        setMidi(midi);
        setPlayingMidiInfo(playingInfo);
        setMode(VISUALIZER_MODE.READ);
        player.clear();
        setActiveMidis([]);

        player.setMidi(midi);

        setLoading(true);

        const _range = setRange(
          midi.tracks[playingInfo.selectedTrackIndex].notes
        );
        player.setRange(_range);

        await player.loadInstruments();
        setLoading(false);

        player.scheduleAndPlay(
          playingInfo,
          (
            notes: NoteWithIdAndEvent[],
            trackIndex: number,
            isComplete?: boolean
          ) => {
            if (trackIndex === playingInfo.selectedTrackIndex) {
              if (isComplete) {
                player.clear();
                setPlaying(false);
                setActiveMidis([]);
                return;
              }

              setActiveMidis(notes.map(note => note.midi));
            }
          }
        );
      })();
    },
    []
  );

  const onTogglePlay = useCallback(() => {
    if (Tone.Transport.state === "stopped") {
      onMidiAndTrackSelect(loadedMidi, playingMidiInfo);
    } else {
      player.togglePlay();
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

  useEffect(() => player.setRange(keyboardRange), [keyboardRange]);

  useEffect(setMidiDevice, [midiDevice]);

  const _instrument = getInstrumentByValue(instrument);

  return (
    <PlayerContext.Provider value={player}>
      <div css={flexOne}>
        <Toast css={toastStyle} />

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
          isPlaying={isPlaying}
          midiDuration={loadedMidi && loadedMidi.duration}
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
        <div css={pianoWrapper}>
          {loading && <Loader css={loaderClass} color={colors.white.base} />}
          <Piano
            activeMidis={activeMidis}
            onPlay={onNoteStart}
            onStop={onNoteStop}
            min={keyboardRange.first}
            max={keyboardRange.last}
            css={loading ? { opacity: 0.2 } : undefined}
          />
        </div>
      </div>
    </PlayerContext.Provider>
  );
}

export default connect(({ midiDevice }: Store) => ({
  midiDevice
}))(SoundPlayer);
