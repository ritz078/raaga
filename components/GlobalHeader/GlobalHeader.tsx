import React, { useState } from "react";
import { Button } from "@components/Button";
import { ModeToggle } from "@components/ModeToggle";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import { TrackList, MidiSettings } from "@components/TrackList";
import { ReactComponent as Logo } from "@assets/logo.svg";
import { Midi } from "@utils/Midi/Midi";
import Icon from "@mdi/react";
import { mdiGithub } from "@mdi/js";

interface GlobalHeaderProps {
  mode: VISUALIZER_MODE;
  onToggleMode: (mode: VISUALIZER_MODE) => void;
  onMidiAndTrackSelect: (midi: Midi, args: MidiSettings) => void;
  midiSettings: MidiSettings;
}

const _GlobalHeader: React.FunctionComponent<GlobalHeaderProps> = ({
  mode,
  onToggleMode,
  onMidiAndTrackSelect,
  midiSettings
}) => {
  const [showTrackSelectionModal, toggleTrackSelectionModal] = useState(false);
  const [loadedMidi, setLoadedMidi] = useState<Midi>();

  const onSelect = (info: MidiSettings) =>
    onMidiAndTrackSelect(loadedMidi, info);

  return (
    <header className="global-header">
      <Logo className="logo" />

      <div className="flex items-center">
        <Button
          onClick={() => toggleTrackSelectionModal(true)}
          className="mr-4 text-xs bg-gray-900 h-8"
        >
          Open File
        </Button>

        <ModeToggle mode={mode} onToggle={onToggleMode} disabled={false} />

        <a
          className="no-underline"
          target="_blank"
          href="https://github.com/ritz078/raaga"
        >
          <Icon path={mdiGithub} color={"#fff"} size={1} />
        </a>
      </div>

      <TrackList
        initialMidiSettings={midiSettings}
        visible={showTrackSelectionModal}
        midi={loadedMidi}
        onPlay={onSelect}
        onClose={() => toggleTrackSelectionModal(false)}
        setMidi={setLoadedMidi}
      />
    </header>
  );
};

export const GlobalHeader = React.memo(_GlobalHeader);
