import InstrumentCard from "@components/TrackList/InstrumentCard";
import * as React from "react";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { Button } from "@components/Button";
import Switch from "react-switch";
import { MidiSettings } from "@components/TrackList/TrackList";
import StartAudioContext from "startaudiocontext";
import Tone from "tone";
import { Midi } from "@utils/Midi/Midi";
import { mdiClose } from "@mdi/js";
import Icon from "@mdi/react";

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

interface TrackSelectionProps {
  midi: Midi;
  onClose: () => void;
  onPlay: (args: MidiSettings) => void;
  initialMidiSettings: MidiSettings;
}

const TrackSelection: React.FunctionComponent<TrackSelectionProps> = ({
  midi,
  onClose,
  onPlay,
  initialMidiSettings
}) => {
  const startAudiContextRef = useRef();

  const { tracks, beats, totalTime, collectionName, ticksPerQuarter } = midi;

  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [playBeats, setPlayBeats] = useState(true);
  const [playBackgroundTracks, setPlayBackgroundTracks] = useState(true);

  useEffect(() => {
    setPlayBackgroundTracks(true);
    setPlayBeats(true);
  }, [midi]);

  useEffect(() => {
    if (!initialMidiSettings) return;
    const {
      selectedTrackIndex,
      playBeats,
      playBackgroundTracks
    } = initialMidiSettings;
    setSelectedTrackIndex(selectedTrackIndex);
    setPlayBeats(playBeats);
    setPlayBackgroundTracks(playBackgroundTracks);
  }, [initialMidiSettings]);

  const _onPlayClick = () => {
    onPlay({
      selectedTrackIndex,
      playBeats,
      playBackgroundTracks
    });
  };

  return (
    <>
      <div className="ts-header">
        <div>
          <span className="text-xl capitalize text-white leading-none">
            {collectionName}
          </span>

          <div className="ts-header-subtext">
            <span className="tl-song-info">
              {tracks.length} Tracks &middot; {"  "}
              {beats.length} Beats &middot; {"  "}
              {totalTime?.toFixed(2)} seconds &middot; {"  "}
              {ticksPerQuarter} ticks/quarter
            </span>
          </div>
        </div>
        <Icon
          path={mdiClose}
          size={1}
          color={"#fff"}
          onClick={onClose}
          className="absolute cursor-pointer top-0 right-0 m-5"
        />
      </div>
      <div className="ts-content">
        <div className="ts-section-title">
          <span className="text-base text-white">Tracks</span>
          <Switch
            checked={playBackgroundTracks}
            onChange={checked => setPlayBackgroundTracks(checked)}
            {...switchProps}
          />
        </div>

        <div className="flex flex-row flex-wrap">
          {midi?.tracks?.map((track, i) => {
            const isSelectedTrack = selectedTrackIndex === i;
            return (
              <InstrumentCard
                disabled={!playBackgroundTracks && !isSelectedTrack}
                onClick={() => setSelectedTrackIndex(i)}
                isSelected={isSelectedTrack}
                key={i}
                instrumentName={
                  (track.instrument && track.instrument.name) || "Unknown"
                }
              />
            );
          })}
        </div>

        {midi && !!beats?.length && (
          <>
            <div className="ts-section-title">
              <span className="text-base text-white">Beats</span>
              <Switch
                checked={playBeats}
                onChange={checked => setPlayBeats(checked)}
                {...switchProps}
              />
            </div>
            <div className="flex flex-row flex-wrap">
              {beats.map((beat, i) => (
                <InstrumentCard
                  disabled={!playBeats}
                  isSelected={false}
                  drums
                  key={i}
                  instrumentName={beat.instrument.name}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div
        ref={startAudiContextRef}
        className="ts-footer"
        onClick={() => {
          StartAudioContext(Tone.context, startAudiContextRef.current);
        }}
      >
        <span />
        <Button onClick={_onPlayClick} className="h-8">
          Play Track
        </Button>
      </div>
    </>
  );
};

export default React.memo(TrackSelection);
