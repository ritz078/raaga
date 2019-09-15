import React, { useState } from "react";
import { Button } from "@components/Button";
import { ModeToggle } from "@components/ModeToggle";
import { Icon } from "@components/Icon";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import { TrackList, MidiSettings } from "@components/TrackList";
import { IMidiJSON } from "@typings/midi";
import { ReactComponent as Logo } from "@assets/logo.svg";

interface GlobalHeaderProps {
  mode: VISUALIZER_MODE;
  onToggleMode: (mode: VISUALIZER_MODE) => void;
  onMidiAndTrackSelect: (midi: IMidiJSON, args: MidiSettings) => void;
  midiSettings: MidiSettings;
}

const _GlobalHeader: React.FunctionComponent<GlobalHeaderProps> = ({
  mode,
  onToggleMode,
  onMidiAndTrackSelect,
  midiSettings
}) => {
  const [showTrackSelectionModal, toggleTrackSelectionModal] = useState(false);
  const [loadedMidi, setLoadedMidi] = useState();

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
          <Icon name="github" color={"#fff"} size={23} />
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
