import * as styles from "@components/TrackList/TrackList.styles";
import InstrumentCard from "@components/TrackList/InstrumentCard";
import { cx } from "emotion";
import * as React from "react";
import { Heading, Text, Switch, Checkbox } from "evergreen-ui";
import { useState } from "react";
import { useEffect } from "react";
import { range } from "lodash";
import { IBeat, ITrack } from "@typings/midi";
import { Icon } from "@components/Icon";

function toggleInArray(arr: number[], num: number) {
  return arr.includes(num) ? arr.filter(a => a !== num) : [...arr, ...[num]];
}

function TrackSelection({ midi, onClose, onPlay }) {
  const { header, tracks, beats, duration } = midi;

  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [playingTracksIndex, setPlayingTracksIndex] = useState([]);
  const [playingBeatsIndex, setPlayingBeatsIndex] = useState([]);

  const playInstrumentsInBackground =
    !!playingBeatsIndex.length || playingTracksIndex.length >= 2;

  // called when a single track's status is toggled
  const toggleTrack = (trackIndex: number) => {
    setPlayingTracksIndex(toggleInArray(playingTracksIndex, trackIndex));
  };

  // called when a single beat's status is toggled
  const toggleBeat = (beatIndex: number) => {
    setPlayingBeatsIndex(toggleInArray(playingBeatsIndex, beatIndex));
  };

  // called when the status of all the tracks is toggled
  const toggleAllTracks = e => {
    if (e.target.checked) {
      setPlayingTracksIndex(range(tracks.length));
    } else {
      setPlayingTracksIndex(
        selectedTrackIndex !== null ? [selectedTrackIndex] : []
      );
    }
  };

  // called when the status of all the beats is toggled
  const toggleAllBeats = e => {
    if (e.target.checked) {
      setPlayingBeatsIndex(range(beats.length));
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
    setPlayingBeatsIndex(range(beats.length));
    setPlayingTracksIndex(range(tracks.length));
  }, [midi]);

  // called when user toggles the behaviour of sounds playing in the background.
  const handleBackgroundPlayChange = e => {
    if (!e.target.checked) {
      setPlayingBeatsIndex([]);
      setPlayingTracksIndex([].concat(selectedTrackIndex));
    } else {
      setPlayingBeatsIndex(range(beats.length));
      setPlayingTracksIndex(range(tracks.length));
    }
  };

  const _onPlayClick = () => {
    onPlay({
      selectedTrackIndex,
      playingTracksIndex,
      playingBeatsIndex
    });
  };

  return (
    <>
      <div className={styles.header}>
        <div>
          <Heading color="#fff" size={600} textTransform="capitalize">
            {header.name[0] || "Unknown"}
          </Heading>

          <div className={styles.titleSubText}>
            <Text color="#8a8a8a">
              {tracks.length} Tracks &middot; {"  "}
              {beats.length} Beats &middot; {"  "}
              {duration && duration.toFixed(2)} seconds &middot; {"  "}
              {header.ppq} ticks/beat
            </Text>
          </div>
        </div>
        <Icon
          name="close"
          size={16}
          onClick={onClose}
          className="absolute cursor-pointer top-0 right-0 m-5"
        />
      </div>
      <div className={styles.content}>
        <div className={styles.sectionTitle}>
          <Heading color="#fff">Tracks</Heading>
          <Switch
            checked={playingTracksIndex.length === tracks.length}
            marginRight={15}
            onChange={toggleAllTracks}
          />
        </div>

        <div className={styles.instrumentWrapper}>
          {midi &&
            tracks &&
            tracks.map((track: ITrack, i) => {
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

        {midi && beats && !!beats.length && (
          <>
            <div className={styles.sectionTitle}>
              <Heading color="#fff">Beats</Heading>
              <Switch
                checked={playingBeatsIndex.length === beats.length}
                marginRight={15}
                onChange={toggleAllBeats}
              />
            </div>
            <div className={styles.instrumentWrapper}>
              {beats.map((beat: IBeat, i) => (
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
        {tracks.length + beats.length > 1 && (
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
    </>
  );
}

export default React.memo(TrackSelection);
