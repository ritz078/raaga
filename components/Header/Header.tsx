import React, { memo, useState } from "react";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import Tone from "tone";
import { MidiSelect } from "@components/MidiSelect";
import { IMidiJSON, INote } from "@typings/midi";
import { Icon } from "@components/Icon";
import cn from "@sindresorhus/class-names";
import Settings from "@components/Settings/Settings";
import { ReadModeControls } from "@components/ReadModeControls";
import { WriteModeControls } from "@components/WriteModeControls";
import { Theme } from "@utils/ThemeContext";

type HeaderProps = React.ComponentProps<typeof ReadModeControls> &
  React.ComponentProps<typeof WriteModeControls> & {
    mode: VISUALIZER_MODE;
    notes?: INote[];
    onTrackSelect?: (midi: IMidiJSON, i) => void;
    midiDeviceId: string;
    onMidiDeviceChange: (midiDevice: string) => void;
    onThemeChange: (theme: Theme) => void;
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
  midiSettings,
  isLoading
}) => {
  const [mute, toggleMute] = useState(false);

  const _toggleMute = () => {
    Tone.Master.mute = !mute;
    toggleMute(!mute);
  };

  const volumeName = mute ? "volume-off" : "volume";

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
        <Icon
          name={volumeName}
          color={"#fff"}
          onClick={_toggleMute}
          size={18}
          className="mx-4 cursor-pointer"
        />

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
