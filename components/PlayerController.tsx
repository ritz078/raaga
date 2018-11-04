// @ts-ignore
import React, { memo, useState, useEffect } from "react";
import { MIDI } from "midiconvert";
import { animated, Transition } from "react-spring";
import Icon from "@components/Icon";
import { colors } from "@anarock/pebble";
import ProgressBar from "@components/ProgressBar";
import {
  loadButton,
  loadFileWrapper,
  playerController,
  playerWrapper
} from "@components/styles/PlayerController.styles";
import { isEmpty } from "lodash";
import TrackSelectionModal from "@components/TrackSelectionModal";
import MidiLoadWorker from "@workers/midiload.worker";
import ProgressCircle from "@components/ProgressCircle";
import Draggable from "react-draggable";

interface PlayerControllerProps {
  midi: MIDI;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onTrackSelect: (midi: MIDI, i: number) => void;
  onComplete: () => void;
  style: {};
}

let worker: Worker;

const fileRef: React.RefObject<HTMLInputElement> = React.createRef();

const PlayerController: React.SFC<PlayerControllerProps> = ({
  midi,
  isPlaying,
  onTogglePlay,
  onTrackSelect,
  onComplete,
  style = {}
}) => {
  const [showTrackSelectionModal, toggleTrackSelectionModal] = useState(false);
  const [loadedMidi, setLoadedMidi] = useState(midi);
  const [showCountdown, toggleCountdown] = useState(false);

  useEffect(() => {
    if (!worker) {
      worker = new MidiLoadWorker();
      worker.onmessage = e => {
        if (e.data.error) {
          alert(e.data.error);
          return;
        }

        setLoadedMidi(e.data.data);
        toggleTrackSelectionModal(true);
      };
    }
  });

  function loadFile(e) {
    const file = e.target.files[0];
    worker.postMessage(file);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  return (
    <animated.div style={style} className={playerWrapper}>
      {!isEmpty(midi) && (
        <Transition
          native
          items={!showCountdown}
          from={{ opacity: 0 }}
          enter={{ opacity: 1 }}
          leave={{ opacity: 0, pointerEvents: "none" }}
        >
          {show =>
            show &&
            (styles => (
              <Draggable bounds="parent">
                <animated.div style={styles} className={playerController}>
                  <Icon
                    name={isPlaying ? "pause" : "play"}
                    color={colors.white.base}
                    onClick={onTogglePlay}
                  />

                  <ProgressBar />
                </animated.div>
              </Draggable>
            ))
          }
        </Transition>
      )}

      {isEmpty(midi) &&
        !showCountdown && (
          <div className={loadFileWrapper}>
            <h3>
              You need to load a MIDI file and then <br /> select a track you
              want to play.
            </h3>
            <label htmlFor="upload-midi" style={{ display: "flex" }}>
              <div className={loadButton}>Load a MIDI file</div>
            </label>
            <input
              onChange={loadFile}
              hidden
              type="file"
              name="photo"
              id="upload-midi"
              accept=".mid"
              ref={fileRef}
            />
          </div>
        )}

      <TrackSelectionModal
        visible={showTrackSelectionModal}
        midi={loadedMidi}
        onSelectTrack={i => {
          toggleTrackSelectionModal(false);
          toggleCountdown(true);
          onTrackSelect(loadedMidi, i);
        }}
        onClose={() => {
          toggleTrackSelectionModal(false);
        }}
      />

      {showCountdown && (
        <ProgressCircle
          onComplete={() => {
            toggleCountdown(false);
            toggleTrackSelectionModal(false);
            onComplete();
          }}
        />
      )}
    </animated.div>
  );
};

export default memo(PlayerController);
