import * as React from "react";
import { Button } from "@components/Button";
import ModeToggle from "@components/ModeToggle";
import Icon from "@components/Icon";
import {
  globalHeaderRight,
  uploadButton,
  mainHeader
} from "./GlobalHeader.styles";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import { useState } from "react";
import { TrackList, TrackSelectionInfo } from "@components/TrackList";
import { IMidiJSON } from "@typings/midi";

interface GlobalHeaderProps {
  mode: VISUALIZER_MODE;
  onToggleMode: (mode: VISUALIZER_MODE) => void;
  onMidiAndTrackSelect: (midi: IMidiJSON, args: TrackSelectionInfo) => void;
}

const _GlobalHeader: React.FunctionComponent<GlobalHeaderProps> = ({
  mode,
  onToggleMode,
  onMidiAndTrackSelect
}) => {
  const [showTrackSelectionModal, toggleTrackSelectionModal] = useState(false);
  const [loadedMidi, setLoadedMidi] = useState();

  const onSelect = (info: TrackSelectionInfo) => {
    toggleTrackSelectionModal(false);
    onMidiAndTrackSelect(loadedMidi, info);
  };

  return (
    <header className={mainHeader}>
      <span>🎹</span>

      <div className={globalHeaderRight}>
        <Button
          icon="upload"
          onClick={() => toggleTrackSelectionModal(true)}
          className={uploadButton}
          iconProps={{
            size: 10
          }}
        >
          Open File
        </Button>

        <ModeToggle mode={mode} onToggle={onToggleMode} disabled={false} />

        <a target="_blank" href="https://github.com/ritz078/raaga">
          <Icon name="github" color={"#fff"} size={23} />
        </a>
      </div>

      <TrackList
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
