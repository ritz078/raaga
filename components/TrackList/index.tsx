import {
  Text,
  Heading,
  Dialog,
  Switch,
  InlineAlert,
  Checkbox
} from "evergreen-ui";
import * as React from "react";
import { useEffect, useState } from "react";
import { Beat, MidiJSON, Track } from "@utils/midiParser/midiParser";
import MidiParse from "@workers/midiParse.worker";
import { promiseWorker } from "@utils/promiseWorker";
import { range } from "lodash";
import InstrumentCard from "@components/TrackList/InstrumentCard";
import * as styles from "./tracklist.styles";
import { cx } from "emotion";

const midiParseWorker = new MidiParse();

function toggleInArray(arr: number[], num: number) {
  return arr.includes(num) ? arr.filter(a => a !== num) : [...arr, ...[num]];
}

interface TrackListProps {
  onPlay?: (args: {
    selectedTrackIndex: number;
    playingTracksIndex: number[];
    playingBeatsIndex: number[];
  }) => void;
  midi?: MidiJSON;
}

const TrackList: React.FunctionComponent<TrackListProps> = ({ onPlay }) => {
  const [midi, loadMidi] = useState<MidiJSON>();
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(null);
  const [playingTracksIndex, setPlayingTracksIndex] = useState([]);
  const [playingBeatsIndex, setPlayingBeatsIndex] = useState([]);

  const playInstrumentsInBackground =
    !!playingBeatsIndex.length || playingTracksIndex.length >= 2;

  // called when a single track's status is toggled
  const toggleTrack = (trackIndex: number) => {
    if (!midi) return;
    setPlayingTracksIndex(toggleInArray(playingTracksIndex, trackIndex));
  };

  // called when a single beat's status is toggled
  const toggleBeat = (beatIndex: number) => {
    if (!midi) return;
    setPlayingBeatsIndex(toggleInArray(playingBeatsIndex, beatIndex));
  };

  // called when the status of all the tracks is toggled
  const toggleAllTracks = e => {
    if (e.target.checked) {
      setPlayingTracksIndex(range(midi.tracks.length));
    } else {
      setPlayingTracksIndex(
        selectedTrackIndex !== null ? [selectedTrackIndex] : []
      );
    }
  };

  // called when the status of all the beats is toggled
  const toggleAllBeats = e => {
    if (e.target.checked) {
      setPlayingBeatsIndex(range(midi.beats.length));
    } else {
      setPlayingBeatsIndex([]);
    }
  };

  // called when a particular track is selected as the primary track
  const selectTrack = i => {
    if (!playingTracksIndex.includes(i)) {
      setPlayingTracksIndex(playingTracksIndex.concat(i));
    }

    setSelectedTrackIndex(i);
  };

  useEffect(() => {
    if (midi) {
      setPlayingBeatsIndex(range(midi.beats.length));
      setPlayingTracksIndex(range(midi.tracks.length));
    }
  }, [midi]);

  // called when user toggles the behaviour of sounds playing in the background.
  const handleBackgroundPlayChange = e => {
    if (!e.target.checked) {
      setPlayingBeatsIndex([]);
      setPlayingTracksIndex([].concat(selectedTrackIndex));
    } else {
      setPlayingBeatsIndex(range(midi.beats.length));
      setPlayingTracksIndex(range(midi.tracks.length));
    }
  };

  useEffect(() => {
    (async () => {
      const midi: MidiJSON = await promiseWorker(midiParseWorker, {
        filePath: "/static/midi/potc.mid"
      });

      loadMidi(midi);
    })();
  }, []);

  const _onPlayClick = () => {
    onPlay({
      selectedTrackIndex,
      playingTracksIndex,
      playingBeatsIndex
    });
  };

  if (!midi) return null;

  return (
    <Dialog
      preventBodyScrolling
      isShown
      onCloseComplete={() => {}}
      hasFooter={false}
      hasHeader={false}
      contentContainerProps={{
        paddingX: 0,
        paddingY: 0
      }}
      shouldCloseOnOverlayClickbool={false}
    >
      <div className={styles.dialogWrapper}>
        <div className={styles.header}>
          <Heading color="#fff" size={600}>
            {midi.header.name[0] || "Unknown"}
          </Heading>

          <div className={styles.titleSubText}>
            <Text color="#8a8a8a">
              {midi.tracks.length} Tracks &middot; {"  "}
              {midi.beats.length} Beats &middot; {"  "}
              {midi.duration && midi.duration.toFixed(2)} seconds &middot;{" "}
              {"  "}
              {midi.header.ppq} ticks/beat
            </Text>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.sectionTitle}>
            <Heading color="#fff">Tracks</Heading>
            <Switch
              checked={playingTracksIndex.length === midi.tracks.length}
              marginRight={15}
              onChange={toggleAllTracks}
            />
          </div>

          <div className={styles.instrumentWrapper}>
            {midi &&
              midi.tracks &&
              midi.tracks.map((track: Track, i) => {
                const isSelectedTrack = selectedTrackIndex === i;
                return (
                  <InstrumentCard
                    disabled={!playingTracksIndex.includes(i)}
                    onClick={() => selectTrack(i)}
                    isSelected={isSelectedTrack}
                    key={i}
                    instrumentName={track.instrument.name}
                    onIconClick={
                      !isSelectedTrack ? () => toggleTrack(i) : undefined
                    }
                  />
                );
              })}
          </div>

          {midi && midi.beats && !!midi.beats.length && (
            <>
              <div className={styles.sectionTitle}>
                <Heading color="#fff">Beats</Heading>
                <Switch
                  checked={playingBeatsIndex.length === midi.beats.length}
                  marginRight={15}
                  onChange={toggleAllBeats}
                />
              </div>
              <div className={styles.instrumentWrapper}>
                {midi.beats.map((beat: Beat, i) => (
                  <InstrumentCard
                    disabled={!playingBeatsIndex.includes(i)}
                    isSelected={false}
                    drums
                    key={i}
                    instrumentName={beat.instrument.name}
                    onIconClick={() => toggleBeat(i)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className={styles.footer}>
          {selectedTrackIndex === null ? (
            <InlineAlert marginBottom={0} intent="none">
              <Text color={"#2196f3"}>
                You need to select a track which can be played with visualizer.
                Other sounds can play in background.
              </Text>
            </InlineAlert>
          ) : (
            <Checkbox
              checked={playInstrumentsInBackground}
              marginY={0}
              label={
                <Text color="#fff" fontSize={14}>
                  Play other instruments in Background
                </Text>
              }
              onChange={handleBackgroundPlayChange}
            />
          )}
          <div
            className={cx(styles.playButton, {
              __disabled__: selectedTrackIndex === null
            })}
            onClick={_onPlayClick}
          >
            Play Track
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default React.memo(TrackList);
