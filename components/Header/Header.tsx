import React, { memo, useState } from "react";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import Tone from "tone";
import { MidiSelect } from "@components/MidiSelect";
import cn from "@sindresorhus/class-names";
import Settings from "@components/Settings/Settings";
import { ReadModeControls } from "@components/ReadModeControls";
import { WriteModeControls } from "@components/WriteModeControls";
import { Theme } from "@utils/typings/Theme";
import { Midi } from "@utils/Midi/Midi";
import { INoteSequence } from "@magenta/music";
import Icon from "@mdi/react";
import { mdiVolumeHigh, mdiVolumeOff } from "@mdi/js";
import { VolumeSlider } from "@components/Header/VolumeSlider";

type HeaderProps = React.ComponentProps<typeof ReadModeControls> &
  React.ComponentProps<typeof WriteModeControls> & {
    mode: VISUALIZER_MODE;
    notes?: INoteSequence["notes"];
    onTrackSelect?: (midi: Midi, i) => void;
    midiDeviceId: string;
    onMidiDeviceChange: (midiDevice: string) => void;
    onThemeChange: (theme: Theme) => void;
    onVolumeChange: (volume: number) => void;
    volume: number;
    isLoading: boolean;
  };

const _Header: React.FunctionComponent<HeaderProps> = ({
  mode,
  instrument,
  onInstrumentChange,
  midiDeviceId,
  onTogglePlay,
  isPlaying,
  onToggleBackground,
  midi,
  range,
  onRangeChange,
  onMidiDeviceChange,
  onThemeChange,
  onVolumeChange,
  volume,
  midiSettings,
  isLoading
}) => {
  const [mute, toggleMute] = useState(false);

  const _toggleMute = () => {
    Tone.Master.mute = !mute;
    toggleMute(!mute);
  };

  const volumeName = mute ? mdiVolumeOff : mdiVolumeHigh;

  return (
    <div className="header">
      <div
        className={cn("flex flex-row items-center", {
          "opacity-25": isLoading
        })}
      >
        {midi && mode === VISUALIZER_MODE.READ && (
          <ReadModeControls
            midiSettings={midiSettings}
            midi={midi}
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
            onToggleBackground={onToggleBackground}
          />
        )}

        {mode === VISUALIZER_MODE.WRITE && (
          <WriteModeControls
            onRangeChange={onRangeChange}
            range={range}
            instrument={instrument}
            onInstrumentChange={onInstrumentChange}
          />
        )}
      </div>

      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row mx-1 items-center">
          <Icon
            path={volumeName}
            color={"#fff"}
            onClick={_toggleMute}
            className="cursor-pointer"
            size={1}
          />
          <div className="px-4">
            <VolumeSlider
              disabled={mute}
              onVolumeChange={onVolumeChange}
              volume={volume}
            />
          </div>
        </div>

        <MidiSelect
          onMidiDeviceChange={onMidiDeviceChange}
          midiDeviceId={midiDeviceId}
        />

        <Settings onThemeChange={onThemeChange} />
      </div>
    </div>
  );
};

export const Header = memo(_Header);
