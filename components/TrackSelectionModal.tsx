import * as React from "react";
import { animated, Transition } from "react-spring";
import {
  modalBottom,
  modalTop,
  trackRow,
  trackSelectionModal
} from "@components/styles/Header.styles";
import { OutsideClick } from "@anarock/pebble";
import { cx } from "emotion";
import prettyMs from "pretty-ms";
import { MIDI } from "midiconvert";

interface TrackSelectionModalProps {
  visible: boolean;
  midi: MIDI;
  onSelectTrack: (index: number) => void;
  onClose: () => void;
}

const TrackSelectionModal: React.SFC<TrackSelectionModalProps> = ({
  visible,
  midi,
  onSelectTrack,
  onClose
}) => {
  console.log(visible);
  return (
    <Transition
      native
      items={visible}
      from={{ opacity: 0, marginTop: 40 }}
      enter={{ opacity: 1, marginTop: 0 }}
      leave={{ opacity: 0, marginTop: 40, pointerEvents: "none" }}
    >
      {show =>
        show &&
        (styles => (
          <animated.div style={styles}>
            <OutsideClick
              onOutsideClick={onClose}
              className={trackSelectionModal}
            >
              <div className={modalTop}>
                <h2>{(midi.header && midi.header.name) || "Unnamed"}</h2>
              </div>

              <div className={modalBottom}>
                {midi.tracks &&
                  midi.tracks.map((track, i) => (
                    <div
                      onClick={() => onSelectTrack(i)}
                      className={cx(trackRow, {
                        __disabled__: !track.duration
                      })}
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
          </animated.div>
        ))
      }
    </Transition>
  );
};

export default TrackSelectionModal;
