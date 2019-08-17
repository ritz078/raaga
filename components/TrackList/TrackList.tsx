import { Dialog, Text } from "evergreen-ui";
import * as React from "react";
import Sidebar from "./Sidebar";
import TrackSelection from "./TrackSelection";
import * as styles from "./TrackList.styles";
import ZeroState from "@assets/images/zero-state.svg";
import { MidiJSON } from "@utils/midiParser/midiParser";

export interface TrackSelectionInfo {
  selectedTrackIndex: number;
  playingTracksIndex: number[];
  playingBeatsIndex: number[];
}

interface TrackListProps {
  onPlay: (args: TrackSelectionInfo) => void;
  midi: MidiJSON;
  visible: boolean;
  onClose: () => void;
  setMidi: (midi: MidiJSON) => void;
}

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
      contentContainerProps={{
        paddingX: 0,
        paddingY: 0
      }}
      shouldCloseOnOverlayClickbool={false}
      width={1265}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row"
        }}
      >
        <Sidebar onMidiLoad={setMidi} />
        <div className={styles.dialogWrapper}>
          {!midi ? (
            <div className={styles.zeroStateWrapper}>
              <div className={styles.zeroStateIllustration}>
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
