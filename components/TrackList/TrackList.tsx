import { Dialog, Text } from "evergreen-ui";
import * as React from "react";
import Sidebar from "./Sidebar";
import TrackSelection from "./TrackSelection";
import { ReactComponent as ZeroState } from "@assets/images/zero-state.svg";
import { IMidiJSON } from "@typings/midi";
import { useState } from "react";

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
  /**
   * This part is mainly written so that `onPlay` is called after the modal has
   * completely closed. So the trackingSelectionInfo is stored in state when
   * play button is clicked on the modal so that it can be later passed in
   * `onPlay` as arguments when the modal has closed.
   *
   * Why?
   *
   * > If I call `onPlay` and close the modal at the same time, the animation
   * will block the main thread and so the listeners being set up for the audio might get
   * delayed. This delay might not be same for the visualizer (that is being controlled from the worker)
   * and the audio events. This will break the sync between those 2 which will be visible in the UI.
   *
   * Importance:
   *
   * This part is completely unnecessary for a normal project in which a ms delay is fine or
   * we don't have to keep different things running is separate threads in sync. (in this case
   * audio and visualizer run in separate threads).
   *
   * Status:
   * Under Investigation/Benchmarking - not yet confirmed.
   */
  const [trackSelectionInfo, setTrackSelectionInfo] = useState<
    TrackSelectionInfo
  >(null);

  const _onClose = () => {
    if (trackSelectionInfo) {
      onPlay(trackSelectionInfo);
    }

    setTrackSelectionInfo(null);
    onClose();
  };
  /**==================================**/

  return (
    <Dialog
      preventBodyScrolling
      isShown={visible}
      onCloseComplete={_onClose}
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
            <TrackSelection
              onPlay={trackSelectionInfo => {
                setTrackSelectionInfo(trackSelectionInfo);
                onClose();
              }}
              onClose={onClose}
              midi={midi}
            />
          )}
        </div>
      </div>
    </Dialog>
  );
};

export const TrackList = React.memo(TrackList_);
