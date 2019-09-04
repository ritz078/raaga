import InstrumentCard from "@components/TrackList/InstrumentCard";
import * as React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { range } from "lodash";
import { IBeat, ITrack } from "@typings/midi";
import { Icon } from "@components/Icon";
import { Button } from "@components/Button";
import Switch from "react-switch";

function toggleInArray(arr: number[], num: number) {
  return arr.includes(num) ? arr.filter(a => a !== num) : [...arr, ...[num]];
}

const switchProps = {
  onColor: "#86d3ff",
  onHandleColor: "#2693e6",
  handleDiameter: 18,
  uncheckedIcon: false,
  checkedIcon: false,
  boxShadow: "0px 1px 5px rgba(0, 0, 0, 0.6)",
  activeBoxShadow: "0px 0px 1px 10px rgba(0, 0, 0, 0.2)",
  height: 8,
  width: 26,
  className: "mr-4"
};

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
  const toggleAllTracks = checked => {
    if (checked) {
      setPlayingTracksIndex(range(tracks.length));
    } else {
      setPlayingTracksIndex(
        selectedTrackIndex !== null ? [selectedTrackIndex] : []
      );
    }
  };

  // called when the status of all the beats is toggled
  const toggleAllBeats = checked => {
    if (checked) {
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
      <div className="ts-header">
        <div>
          <span className="text-xl capitalize text-white leading-none">
            {header.label}
          </span>

          <div className="ts-header-subtext">
            <span className="tl-song-info">
              {tracks.length} Tracks &middot; {"  "}
              {beats.length} Beats &middot; {"  "}
              {duration && duration.toFixed(2)} seconds &middot; {"  "}
              {header.ppq} ticks/beat
            </span>
          </div>
        </div>
        <Icon
          name="close"
          size={16}
          onClick={onClose}
          className="absolute cursor-pointer top-0 right-0 m-5"
        />
      </div>
      <div className="ts-content">
        <div className="ts-section-title">
          <span className="text-base text-white">Tracks</span>
          <Switch
            checked={playingTracksIndex.length === tracks.length}
            onChange={toggleAllTracks}
            {...switchProps}
          />
        </div>

        <div className="flex flex-row flex-wrap">
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
            <div className="ts-section-title">
              <span className="text-base text-white">Beats</span>
              <Switch
                checked={playingBeatsIndex.length === beats.length}
                onChange={toggleAllBeats}
                {...switchProps}
              />
            </div>
            <div className="flex flex-row flex-wrap">
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

      <div className="ts-footer">
        {tracks.length + beats.length > 1 ? (
          <label
            htmlFor="playAll"
            className="flex flex-row items-center cursor-pointer"
          >
            <input
              type="checkbox"
              id="playAll"
              onChange={handleBackgroundPlayChange}
              checked={playInstrumentsInBackground}
            />
            <div className="text-sm text-white ml-2">
              Play sounds in background.
            </div>
          </label>
        ) : (
          <span />
        )}
        <Button onClick={_onPlayClick} className="h-8">
          Play Track
        </Button>
      </div>
    </>
  );
}

export default React.memo(TrackSelection);
