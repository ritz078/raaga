import React, { useCallback, useEffect, useState } from "react";
import {
  getMidiRange,
  IScheduleOptions,
  isWithinRange,
  MidiPlayer
} from "@utils";
import { getPianoRangeAndShortcuts } from "@utils/keyboard";
import { Visualizer } from "@components/Visualizer";
import { Piano } from "./Piano";
import { Header } from "@components/Header";
import CanvasWorker, {
  CanvasWorkerFallback
} from "@controllers/visualizer.controller";
import { getInstrumentIdByValue, instruments } from "midi-instruments";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import webMidi from "webmidi";
import Tone from "tone";
import {
  DEFAULT_FIRST_KEY,
  DEFAULT_LAST_KEY,
  PIANO_HEIGHT
} from "@config/piano";
import { IMidiJSON } from "@typings/midi";
import { GlobalHeader } from "@components/GlobalHeader";
import { TrackSelectionInfo } from "@components/TrackList";
import { NoteWithIdAndEvent } from "@utils/MidiPlayer/MidiPlayer.utils";
import { Range } from "@utils/typings/Visualizer";
import { ReactComponent as Loader } from "@assets/images/loader.svg";

const range = {
  first: DEFAULT_FIRST_KEY,
  last: DEFAULT_LAST_KEY
};

const canvasWorker: CanvasWorkerFallback = new CanvasWorker();
const player = new MidiPlayer(canvasWorker, range);
export const PlayerContext = React.createContext(player);

const SoundPlayer: React.FunctionComponent<{}> = () => {
  const [instrument, setInstrument] = useState(instruments[0].value);
  const [loading, setLoading] = useState(false);
  const [activeMidis, setActiveMidis] = useState<number[]>([]);
  const [keyboardRange, setKeyboardRange] = useState<Range>(range);
  const [isPlaying, setPlaying] = useState(false);
  const [mode, setMode] = useState<VISUALIZER_MODE>(VISUALIZER_MODE.WRITE);
  const [playingMidiInfo, setPlayingMidiInfo] = useState<IScheduleOptions>(
    null
  );
  const [loadedMidi, setMidi] = useState<IMidiJSON>(null);
  const [midiDevice, setSelectedMidiDevice] = useState(null);

  const resetPlayer = useCallback(() => {
    player.clear();
    setActiveMidis([]);
    setKeyboardRange(range);
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

  const setRange = notes => {
    // change piano range.
    const requiredRange = getMidiRange(notes);

    if (!isWithinRange(requiredRange, [range.first, range.last])) {
      const _range = getPianoRangeAndShortcuts(requiredRange).range;
      setKeyboardRange(_range);
      setPlaying(true);
      return _range;
    }

    return keyboardRange;
  };

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
    (midi: IMidiJSON, trackSelectionInfo: TrackSelectionInfo) => {
      (async () => {
        setPlaying(true);
        setMidi(midi);
        setPlayingMidiInfo(trackSelectionInfo);
        setMode(VISUALIZER_MODE.READ);
        player.clear();
        setActiveMidis([]);

        player.setMidi(midi);

        setLoading(true);

        const _range = setRange(
          midi.tracks[trackSelectionInfo.selectedTrackIndex].notes
        );
        player.setRange(_range);

        await player.loadInstruments();
        setLoading(false);

        player.scheduleAndPlay(
          trackSelectionInfo,
          (
            notes: NoteWithIdAndEvent[],
            trackIndex: number,
            isComplete?: boolean
          ) => {
            if (trackIndex === trackSelectionInfo.selectedTrackIndex) {
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
    player.setMode(mode);
  }, [mode]);

  useEffect(() => {
    changeInstrument();
    setMidiDevice();
  }, []);

  useEffect(() => player.setRange(keyboardRange), [keyboardRange]);

  useEffect(setMidiDevice, [midiDevice]);

  return (
    <PlayerContext.Provider value={player}>
      <div className="flex flex-1 relative flex-col">
        <GlobalHeader
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
          onRangeChange={_range => {
            const { range } = getPianoRangeAndShortcuts(_range, false);
            player.setRange(range);
            setKeyboardRange(range);
          }}
          onMidiDeviceChange={setSelectedMidiDevice}
        />

        <Visualizer
          range={keyboardRange}
          mode={mode}
          canvasWorker={canvasWorker}
        />
      </div>
      <div
        className="flex justify-center relative items-center border-t border-black"
        style={{
          height: PIANO_HEIGHT
        }}
      >
        {loading && <Loader className="absolute z-10" />}
        <Piano
          activeMidis={activeMidis}
          onPlay={onNoteStart}
          onStop={onNoteStop}
          min={keyboardRange.first}
          max={keyboardRange.last}
          className={loading ? "opacity-25" : undefined}
        />
      </div>
    </PlayerContext.Provider>
  );
};

export default SoundPlayer;
