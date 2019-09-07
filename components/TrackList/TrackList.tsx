import React, { ComponentProps, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import TrackSelection from "./TrackSelection";
import { ReactComponent as ZeroState } from "@assets/images/zero-state.svg";
import { IMidiJSON } from "@typings/midi";
import { Modal } from "@components/Modal";

export interface MidiSettings {
  selectedTrackIndex: number;
  playBackgroundTracks: boolean;
  playBeats: boolean;
}

type TrackListProps = ComponentProps<typeof TrackSelection> & {
  visible: boolean;
  setMidi?: (midi: IMidiJSON) => void;
  hasFileLoad?: boolean;
};

const TrackList_: React.FunctionComponent<TrackListProps> = ({
  onPlay,
  visible,
  onClose,
  midi,
  setMidi,
  hasFileLoad = true,
  initialMidiSettings
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
  const [midiSettings, setMidiSettings] = useState<MidiSettings>(
    initialMidiSettings
  );

  const [closeRequestedForPlay, setCloseRequestedForPlay] = useState(false);

  const _onClose = () => {
    if (closeRequestedForPlay) {
      onPlay(midiSettings);
    }
    setCloseRequestedForPlay(false);
    onClose();
  };
  /**==================================**/

  return (
    <Modal
      visible={visible}
      onCloseRequest={_onClose}
      onCloseComplete={_onClose}
    >
      <div className="flex flex-row flex-1" style={{ width: 1265 }}>
        {hasFileLoad && <Sidebar onMidiLoad={setMidi} />}
        <div className="flex flex-1 flex-col overflow-hidden">
          {!midi ? (
            <div className="tl-zero-state-illus-wrapper">
              <div>
                <ZeroState width={300} height={250} />
                <div className="text-gray-600 text-sm">
                  Seems you haven't selected any MIDI. You can either upload a
                  local file or select from the given samples.
                </div>
              </div>
            </div>
          ) : (
            <TrackSelection
              initialMidiSettings={midiSettings}
              onPlay={trackSelectionInfo => {
                setMidiSettings(trackSelectionInfo);
                setCloseRequestedForPlay(true);
                onClose();
              }}
              onClose={onClose}
              midi={midi}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export const TrackList = React.memo(TrackList_);
