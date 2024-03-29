import React, { FunctionComponent, memo, useContext } from "react";
import { ProgressBar } from "@components/ProgressBar";
import { PlaybackSpeed } from "@components/PlaybackSpeed";
import { Button } from "@components/Button";
import { Dropdown } from "@components/Dropdown";
import { MidiSettings } from "@components/TrackList";
import { PlayerContext } from "@utils/PlayerContext";
import { Midi } from "@utils/Midi/Midi";
import { mdiInstrumentTriangle, mdiPause, mdiPiano, mdiPlay } from "@mdi/js";
import Icon from "@mdi/react";

export enum TOGGLE_BACKGROUND_TYPE {
  TRACKS = 1,
  BEATS
}

interface ReadModeControlsProps {
  midi: Midi;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onToggleBackground: (midiSettings: MidiSettings) => void;
  midiSettings: MidiSettings;
}

const _ReadModeControls: FunctionComponent<ReadModeControlsProps> = ({
  midi,
  isPlaying,
  onTogglePlay,
  onToggleBackground,
  midiSettings
}) => {
  if (!midiSettings) return;

  const player = useContext(PlayerContext);
  const playName = isPlaying ? mdiPause : mdiPlay;

  const { playBeats, playBackgroundTracks } = midiSettings;

  const handleToggleBackground = (type: TOGGLE_BACKGROUND_TYPE) => {
    if (type === TOGGLE_BACKGROUND_TYPE.BEATS) {
      player.toggleBeatsVolume();
      onToggleBackground({
        ...midiSettings,
        playBeats: !playBeats
      });
    } else if (type === TOGGLE_BACKGROUND_TYPE.TRACKS) {
      player.toggleTracksVolume();
      onToggleBackground({
        ...midiSettings,
        playBackgroundTracks: !playBackgroundTracks
      });
    }
  };

  return (
    <>
      <div className="header-midi-name" title={midi.collectionName}>
        {midi.collectionName}
      </div>

      <div className="player-wrapper">
        <Icon
          path={playName}
          color="#fff"
          size={1}
          className="cursor-pointer"
          onClick={onTogglePlay}
        />

        <ProgressBar duration={midi?.totalTime} />
      </div>

      <PlaybackSpeed />

      <Dropdown
        contentClassName="instrument-selector"
        label={() => <Button className="h-8 mr-3">Background Sounds</Button>}
      >
        {(close) => (
          <div className="py-1 w-64">
            <div
              className="instrument-list"
              onClick={() => {
                handleToggleBackground(TOGGLE_BACKGROUND_TYPE.BEATS);
                close();
              }}
            >
              <Icon path={mdiInstrumentTriangle} size={0.8} className="mr-2" />
              {playBeats ? "Mute" : "Play"} Background Beats/Percussion
            </div>
            <div
              className="instrument-list"
              onClick={() => {
                handleToggleBackground(TOGGLE_BACKGROUND_TYPE.TRACKS);
                close();
              }}
            >
              <Icon path={mdiPiano} size={0.8} className="mr-2" />
              {playBackgroundTracks ? "Mute" : "Play"} Background Tracks
            </div>
          </div>
        )}
      </Dropdown>
    </>
  );
};

export const ReadModeControls = memo(_ReadModeControls);
