import React, { memo, useCallback, useState } from "react";
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
import exampleMidis from "../midi.json";
import { loadMidiAsync } from "@utils/loadMidi";

const RecordingsSidebar: React.FunctionComponent<RecordingsSidebarProps> = ({
  visible,
  onClose,
  midis,
  dispatch,
  onTrackSelect
}) => {
  const [showTrackSelectionModal, toggleTrackSelectionModal] = useState(false);
  const [loadedMidi, setLoadedMidi] = useState(undefined);

  const loadFileAndGetParsedMidi = useCallback(async ({ url }) => {
    const midi = await loadMidiAsync(url);
    setLoadedMidi(midi);
    onClose();
    toggleTrackSelectionModal(true);
  }, []);

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

        {exampleMidis.map(midi => (
          <div key={midi.label} onClick={() => loadFileAndGetParsedMidi(midi)}>
            {midi.label}
          </div>
        ))}
        {midis.map((recording, i) => {
          const { tracks, duration, header, id } = recording;

          const track = tracks[0];
          return (
            <div key={id} className={recordingRow}>
              <div>
                <div>{header.name || "Unnamed"}</div>
                <div className={recordingRowBottom}>
                  {(duration || 0).toFixed(2)}s <span>&bull;</span>
                  {tracks.length} track
                  <span>&bull;</span>
                  {track.instrument.name}
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
          onSelectComplete={i => {
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

export default memo(RecordingsSidebar);
