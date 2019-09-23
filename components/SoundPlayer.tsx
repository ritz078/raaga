import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react";
import { getMidiRange, isWithinRange } from "@utils";
import { getPianoRangeAndShortcuts } from "@utils/keyboard";
import { Visualizer } from "@components/Visualizer";
import { Piano } from "./Piano";
import { Header } from "@components/Header";
import { getInstrumentIdByValue, instruments } from "midi-instruments";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import webMidi from "webmidi";
import Tone from "tone";
import { DEFAULT_FIRST_KEY, DEFAULT_LAST_KEY } from "@config/piano";
import { IMidiJSON } from "@typings/midi";
import { GlobalHeader } from "@components/GlobalHeader";
import { MidiSettings } from "@components/TrackList";
import { NoteWithIdAndEvent } from "@utils/MidiPlayer/MidiPlayer.utils";
import { Range } from "@utils/typings/Visualizer";
import { Loader } from "@components/Loader";
import { OFFSCREEN_2D_CANVAS_SUPPORT } from "@enums/offscreen2dCanvasSupport";
import { player, PlayerContext } from "@utils/PlayerContext";
import { wrap } from "comlink";
import CanvasWorker from "@workers/canvas.worker";
import { controlVisualizer } from "@utils/visualizerControl";

const range = {
  first: DEFAULT_FIRST_KEY,
  last: DEFAULT_LAST_KEY
};

const SoundPlayer: React.FunctionComponent<{
  offScreenCanvasSupport: OFFSCREEN_2D_CANVAS_SUPPORT;
}> = ({ offScreenCanvasSupport }) => {
  const [instrument, setInstrument] = useState(instruments[0].value);
  const [loading, setLoading] = useState(false);
  const [activeMidis, setActiveMidis] = useState<number[]>([]);
  const [keyboardRange, setKeyboardRange] = useState<Range>(range);
  const [isPlaying, setPlaying] = useState(false);
  const [mode, setMode] = useState<VISUALIZER_MODE>(VISUALIZER_MODE.WRITE);
  const [midiSettings, setMidiSettings] = useState<MidiSettings>(null);
  const [loadedMidi, setMidi] = useState<IMidiJSON>(null);
  const [midiDevice, setSelectedMidiDevice] = useState(null);
  const [activeInstrumentMidis, setActiveInstrumentMidis] = useState([]);

  const canvasProxyRef = useRef<any>(
    offScreenCanvasSupport === OFFSCREEN_2D_CANVAS_SUPPORT.SUPPORTED
      ? wrap(new CanvasWorker())
      : controlVisualizer
  );

  useEffect(() => {
    player.set2dOffscreenCanvasSupport(offScreenCanvasSupport);
    player.setCanvasProxy(canvasProxyRef.current);
  }, [offScreenCanvasSupport]);

  const changeInstrument = useCallback(
    (_instrument = instrument) => {
      (async () => {
        setLoading(true);
        await player.loadInstruments({
          instrumentIds: [getInstrumentIdByValue(_instrument)]
        });
        setInstrument(_instrument);
        setLoading(false);
      })();
    },
    [player]
  );

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
    [range]
  );

  const onNoteStart = useCallback(
    (midi, velocity = 1, isFromMidiDevice = false) => {
      player.playNote(midi, instrument, velocity);
      if (mode === VISUALIZER_MODE.WRITE || !isFromMidiDevice) {
        setActiveMidis(_activeMidis => _activeMidis.concat(midi));
      } else {
        setActiveInstrumentMidis(_activeMidis => _activeMidis.concat(midi));
      }
    },
    [instrument, mode, player]
  );

  const onNoteStop = useCallback(
    (midi, isFromMidiDevice = false) => {
      player.stopNote(midi, instrument);
      if (mode === VISUALIZER_MODE.WRITE || !isFromMidiDevice) {
        setActiveMidis(_activeMidis =>
          _activeMidis.filter(activeMidi => activeMidi !== midi)
        );
      } else {
        setActiveInstrumentMidis(_activeMidis =>
          _activeMidis.filter(x => x !== midi)
        );
      }
    },
    [player, mode, instrument]
  );

  useEffect(() => {
    if (loadedMidi && midiSettings) {
      const _range = setRange(
        loadedMidi.tracks[midiSettings.selectedTrackIndex].notes
      );
      player.setRange(_range);
      setKeyboardRange(_range);
    }
  }, [loadedMidi, midiSettings, setRange]);

  const onMidiAndTrackSelect = useCallback(
    (midi: IMidiJSON, _midiSettings: MidiSettings) => {
      (async () => {
        setLoading(true);
        await player.clear();
        setActiveMidis([]);
        setActiveInstrumentMidis([]);
        setPlaying(true);
        setMidi(midi);
        setMidiSettings(_midiSettings);
        setMode(VISUALIZER_MODE.READ);

        player.setMidi(midi);

        await player.loadInstruments();
        setLoading(false);

        await player.scheduleAndPlay(
          _midiSettings,
          (
            notes: NoteWithIdAndEvent[],
            trackIndex: number,
            isComplete?: boolean
          ) => {
            if (trackIndex === _midiSettings.selectedTrackIndex) {
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
    [player]
  );

  const onTogglePlay = useCallback(() => {
    if (Tone.Transport.state === "stopped") {
      onMidiAndTrackSelect(loadedMidi, midiSettings);
    } else {
      player.togglePlay();
    }

    setPlaying(!isPlaying);
  }, [isPlaying]);

  useLayoutEffect(() => {
    setActiveMidis([]);
    setActiveInstrumentMidis([]);
  }, [mode]);

  useEffect(() => {
    player.clear();
    player.setMode(mode);
  }, [mode]);

  useEffect(changeInstrument, []);

  useEffect(() => player.setRange(keyboardRange), [keyboardRange]);

  useEffect(() => {
    const _onNoteStart = e => {
      onNoteStart(e.note.number, e.velocity, true);
    };

    const _onNoteStop = e => {
      onNoteStop(e.note.number, true);
    };

    const input = webMidi.getInputById(midiDevice);

    if (input) {
      input.addListener("noteon", "all", _onNoteStart);
      input.addListener("noteoff", "all", _onNoteStop);
    }
    return () => {
      if (input) {
        input.removeListener("noteon", "all", _onNoteStart);
        input.removeListener("noteoff", "all", _onNoteStop);
      }
    };
  }, [midiDevice, onNoteStart, onNoteStop]);

  const handleRangeChange = useCallback(
    _range => {
      const { range } = getPianoRangeAndShortcuts(_range, false);
      player.setRange(range);
      setKeyboardRange(range);
    },
    [player]
  );

  return (
    <PlayerContext.Provider value={player}>
      <div className="flex flex-1 relative flex-col overflow-hidden">
        <GlobalHeader
          midiSettings={midiSettings}
          mode={mode}
          onToggleMode={setMode}
          onMidiAndTrackSelect={onMidiAndTrackSelect}
        />

        <Header
          onTogglePlay={onTogglePlay}
          instrument={instrument}
          mode={mode}
          onInstrumentChange={changeInstrument}
          midiDeviceId={midiDevice}
          isPlaying={isPlaying}
          midi={loadedMidi}
          range={keyboardRange}
          onRangeChange={handleRangeChange}
          onToggleBackground={setMidiSettings}
          midiSettings={midiSettings}
          onMidiDeviceChange={setSelectedMidiDevice}
          isLoading={loading}
        />

        <Visualizer
          range={keyboardRange}
          mode={mode}
          canvasProxy={canvasProxyRef.current}
          offScreenCanvasSupport={offScreenCanvasSupport}
        />
      </div>
      <div className="piano-wrapper">
        {loading && <Loader className="absolute z-10 h-4" />}
        <Piano
          activeMidis={activeMidis}
          onPlay={onNoteStart}
          onStop={onNoteStop}
          min={keyboardRange.first}
          max={keyboardRange.last}
          className={loading ? "opacity-25" : undefined}
          activeInstrumentMidis={activeInstrumentMidis}
        />
      </div>
    </PlayerContext.Provider>
  );
};

export default memo(SoundPlayer);
