import React, { memo, useState } from "react";
import { colors, mixins, SideBar } from "@anarock/pebble";
import { MIDI } from "midiconvert";
import { css } from "emotion";
import Icon from "@components/Icon";
import { AnyAction, Dispatch } from "redux";
import { ReducersType } from "@enums/reducers";
import TrackSelectionModal from "@components/TrackSelectionModal";

interface RecordingsSidebarProps {
  visible: boolean;
  onClose: () => void;
  recordings: (MIDI & {
    id: string;
  })[];
  dispatch: Dispatch<AnyAction>;
  onTrackSelect: (midi: MIDI, i) => void;
}

const iconClass = css({
  display: "inline-block",
  padding: "0 14px",
  cursor: "pointer",
  "&:hover": {
    color: colors.gray.darker
  }
});

const RecordingsSidebar: React.SFC<RecordingsSidebarProps> = ({
  visible,
  onClose,
  recordings,
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
          Recordings
        </h3>

        {recordings.map((recording, i) => {
          const track = recording.tracks[0];
          return (
            <div
              key={recording.id}
              style={{
                borderBottom: `1px solid ${colors.gray.lightest}`,
                fontSize: 14,
                padding: "15px 0",
                ...mixins.flexSpaceBetween,
                alignItems: "center"
              }}
            >
              <div>
                <div>{recording.header.name || "Unnamed"}</div>
                <div
                  className={css({
                    color: "#888",
                    marginTop: 8,
                    span: {
                      display: "inline-block",
                      margin: "0 8px"
                    }
                  })}
                >
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
            onTrackSelect(loadedMidi, i);
          }}
          onClose={() => {
            toggleTrackSelectionModal(false);
          }}
        />
      </div>
    </SideBar>
  );
};

// @ts-ignore
export default memo(RecordingsSidebar);
