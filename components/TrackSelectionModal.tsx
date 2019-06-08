import * as React from "react";
import {
  modalBottom,
  modalTop,
  trackRow,
  trackSelectionModal
} from "@components/styles/Header.styles";
import { OutsideClick } from "@anarock/pebble";
import prettyMs from "pretty-ms";
import { MIDI } from "midiconvert";
import Modal from "@components/Modal";

interface TrackSelectionModalProps {
  visible: boolean;
  midi: MIDI;
  onSelectTrack: (index: number) => void;
  onClose: () => void;
}

const TrackSelectionModal: React.FunctionComponent<
  TrackSelectionModalProps
> = ({ visible, midi, onSelectTrack, onClose }) => {
  if (!midi) return null;
  return (
    <Modal
      visible={visible}
      contentStyles={{
        padding: 0,
        width: 600
      }}
    >
      <OutsideClick onOutsideClick={onClose} className={trackSelectionModal}>
        <div className={modalTop}>
          <h2>{(midi.header && midi.header.name) || "Unnamed"}</h2>
        </div>

        <div className={modalBottom}>
          {midi.tracks &&
            midi.tracks
              .filter(track => track.duration)
              .map((track, i) => (
                <div
                  onClick={() => onSelectTrack(i)}
                  className={trackRow}
                  key={i}
                  data-index={i}
                >
                  <div style={{ paddingRight: 20 }}>#{i + 1}</div>
                  <div className="__name__">{track.name || "Unnamed"}</div>
                  <div style={{ flex: 1 }}>{track.instrument || "N/A"}</div>
                  <div style={{ flex: 0.5 }}>
                    {prettyMs(track.duration * 1000)}
                  </div>
                  <div style={{ flex: 0.5 }}>
                    {track.notes && track.notes.length} Notes
                  </div>
                  <div className="__play__">
                    {!!track.duration && <i className="icon icon-play" />}
                  </div>
                </div>
              ))}
        </div>
      </OutsideClick>
    </Modal>
  );
};

// @ts-ignore
export default React.memo(TrackSelectionModal);
