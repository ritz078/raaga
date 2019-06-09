import React, { memo, useState } from "react";
import { colors, SideBar } from "@anarock/pebble";
import Icon from "@components/Icon";
import { ReducersType } from "@enums/reducers";
import TrackSelectionModal from "@components/TrackSelectionModal";
import { RecordingsSidebarProps } from "@components/typings/RecordingSidebar";
import {
  iconClass,
  recordingRow,
  recordingRowBottom
} from "@components/styles/RecordingSidebar.styles";

const RecordingsSidebar: React.FunctionComponent<RecordingsSidebarProps> = ({
  visible,
  onClose,
  midis,
  dispatch,
  onTrackSelect
}) => {
  const [showTrackSelectionModal, toggleTrackSelectionModal] = useState(false);
  const [loadedMidi, setLoadedMidi] = useState(undefined);

  return (
    <SideBar onClose={onClose} isOpen={visible} width={500} closeOnOutsideClick>
      <div style={{ padding: 30 }}>
        <h3
          style={{
            marginBottom: 20
          }}
        >
          Saved MIDIs
        </h3>

        {midis.map((recording, i) => {
          const track = recording.tracks[0];
          return (
            <div key={recording.id} className={recordingRow}>
              <div>
                <div>{recording.header.name || "Unnamed"}</div>
                <div className={recordingRowBottom}>
                  {recording.duration.toFixed(2)}s <span>&bull;</span>
                  {recording.tracks.length} track
                  <span>&bull;</span>
                  {track.instrument}
                </div>
              </div>

              <div>
                <Icon
                  name="play"
                  size={15}
                  className={iconClass}
                  color={colors.gray.dark}
                  onClick={() => {
                    setLoadedMidi(recording);
                    onClose();
                    toggleTrackSelectionModal(true);
                  }}
                />
                <Icon
                  name="stop"
                  size={15}
                  className={iconClass}
                  color={colors.gray.dark}
                  onClick={() =>
                    dispatch({
                      type: ReducersType.DELETE_RECORDING,
                      payload: i
                    })
                  }
                />
              </div>
            </div>
          );
        })}

        <TrackSelectionModal
          visible={showTrackSelectionModal}
          midi={loadedMidi}
          onSelectTrack={i => {
            toggleTrackSelectionModal(false);
            dispatch({
              type: ReducersType.TOGGLE_COUNTER_STATUS,
              payload: false
            });
            onTrackSelect(loadedMidi, i);
          }}
          onClose={() => {
            toggleTrackSelectionModal(false);
          }}
          onCounterStart={() =>
            dispatch({
              type: ReducersType.TOGGLE_COUNTER_STATUS,
              payload: true
            })
          }
        />
      </div>
    </SideBar>
  );
};

export default memo(RecordingsSidebar);
