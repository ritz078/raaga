import React, { memo, useState, useRef } from "react";
import { animated, useTransition } from "react-spring";
import Icon from "@components/Icon";
import { colors, mixins } from "@anarock/pebble";
import ProgressBar from "@components/ProgressBar";
import {
  controllerBottom,
  loadButton,
  loadFileIcon,
  loadFileWrapper,
  midiNameStyle,
  playerController,
  playerWrapper
} from "@components/styles/PlayerController.styles";
import { isEmpty } from "lodash";
import TrackSelectionModal from "@components/TrackSelectionModal";
import Draggable from "react-draggable";
import StartAudioContext from "startaudiocontext";
import Tone from "tone";
import { PlayerControllerProps } from "@components/typings/PlayerController";
import FileLoad from "@components/FileLoad";

const PlayerController: React.FunctionComponent<PlayerControllerProps> = ({
  midi,
  isPlaying,
  onTogglePlay,
  onTrackSelect,
  onStartPlay,
  style = {},
  onToggleSidebar
}) => {
  const safariContextStartClickRef = useRef(null);
  const [showTrackSelectionModal, toggleTrackSelectionModal] = useState(false);
  const [loadedMidi, setLoadedMidi] = useState(midi);
  const transitions = useTransition(showTrackSelectionModal, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0, pointerEvents: "none" }
  });

  return (
    <animated.div style={style} className={playerWrapper}>
      {!isEmpty(midi) &&
        transitions.map(
          ({ item, props }) =>
            item && (
              <Draggable bounds="parent" axis="x">
                <animated.div style={props} className={playerController}>
                  <div style={{ flex: 1 }}>
                    <div className={midiNameStyle}>
                      {midi.header.name || "Unknown"}{" "}
                    </div>
                    <div className={controllerBottom}>
                      <Icon
                        name={isPlaying ? "pause" : "play"}
                        color={colors.white.base}
                        onClick={onTogglePlay}
                        size={16}
                      />

                      <ProgressBar />

                      <Icon
                        name="replay"
                        color={colors.white.base}
                        onClick={() => onStartPlay()}
                      />
                    </div>
                  </div>
                  <div className={loadFileIcon}>
                    <FileLoad
                      onMidiLoad={data => {
                        setLoadedMidi(data.data);
                        toggleTrackSelectionModal(true);
                      }}
                      label={
                        <Icon
                          name="midi-file"
                          size={30}
                          color={colors.white.base}
                        />
                      }
                    />
                  </div>
                </animated.div>
              </Draggable>
            )
        )}

      {isEmpty(midi) && (
        <div className={loadFileWrapper}>
          <h3>
            You need to load a MIDI file and then <br /> select a track you want
            to play.
          </h3>

          <div style={mixins.flexSpaceBetween}>
            <FileLoad
              onMidiLoad={data => {
                setLoadedMidi(data.data);
                toggleTrackSelectionModal(true);
              }}
              label={
                <button className={loadButton}>
                  <Icon name="upload" color={colors.gray.darker} size={12} />
                  &nbsp;&nbsp; Load a MIDI file
                </button>
              }
            />

            <button className={loadButton} onClick={onToggleSidebar}>
              Open Saved MIDI
            </button>
          </div>
        </div>
      )}

      <div
        ref={safariContextStartClickRef}
        onClick={() => {
          // On iOS, the Web Audio API requires sounds to be triggered from an explicit user action,
          // such as a tap. Calling noteOn() from an onload event will not play sound.
          StartAudioContext(Tone.context, safariContextStartClickRef.current);
        }}
      >
        <TrackSelectionModal
          visible={showTrackSelectionModal}
          midi={loadedMidi}
          onSelectTrack={i => {
            toggleTrackSelectionModal(false);
            onStartPlay();
            onTrackSelect(loadedMidi, i);
          }}
          onClose={() => {
            toggleTrackSelectionModal(false);
          }}
        />
      </div>
    </animated.div>
  );
};

export default memo(PlayerController);
