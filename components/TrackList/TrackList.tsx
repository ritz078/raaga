import { Dialog, Text } from "evergreen-ui";
import * as React from "react";
import Sidebar from "./Sidebar";
import TrackSelection from "./TrackSelection";
import { ReactComponent as ZeroState } from "@assets/images/zero-state.svg";
import { IMidiJSON } from "@typings/midi";

export interface TrackSelectionInfo {
  selectedTrackIndex: number;
  playingTracksIndex: number[];
  playingBeatsIndex: number[];
}

interface TrackListProps {
  onPlay: (args: TrackSelectionInfo) => void;
  midi: IMidiJSON;
  visible: boolean;
  onClose: () => void;
  setMidi: (midi: IMidiJSON) => void;
}

const contentContainerProps = {
  paddingX: 0,
  paddingY: 0
};

const TrackList_: React.FunctionComponent<TrackListProps> = ({
  onPlay,
  visible,
  onClose,
  midi,
  setMidi
}) => {
  return (
    <Dialog
      preventBodyScrolling
      isShown={visible}
      onCloseComplete={onClose}
      hasFooter={false}
      hasHeader={false}
      contentContainerProps={contentContainerProps}
      shouldCloseOnOverlayClickbool={false}
      width={1265}
    >
      <div className="flex flex-row flex-1">
        <Sidebar onMidiLoad={setMidi} />
        <div className="flex flex-1 flex-col overflow-hidden">
          {!midi ? (
            <div className="tl-zero-state-illus-wrapper">
              <div>
                <ZeroState width={300} height={250} />
                <Text color="#7b7b7b" marginTop={10}>
                  Seems you haven't selected any MIDI. You can either upload a
                  local file or select from the given samples.
                </Text>
              </div>
            </div>
          ) : (
            <TrackSelection onPlay={onPlay} onClose={onClose} midi={midi} />
          )}
        </div>
      </div>
    </Dialog>
  );
};

export const TrackList = React.memo(TrackList_);
