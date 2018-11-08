// @ts-ignore
import React, { memo, useState, useEffect, useRef } from "react";
import { animated, Transition } from "react-spring";
import Icon from "@components/Icon";
import { colors } from "@anarock/pebble";
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
import ProgressCircle from "@components/ProgressCircle";
import Draggable from "react-draggable";
import StartAudioContext from "startaudiocontext";
import Tone from "tone";
import { PlayerControllerProps } from "@components/typings/PlayerController";
import FileLoad from "@components/FileLoad";

const PlayerController: React.SFC<PlayerControllerProps> = ({
  midi,
  isPlaying,
  onTogglePlay,
  onTrackSelect,
  onStartPlay,
  style = {}
}) => {
  const safariContextStartClickRef = useRef(null);
  const [showTrackSelectionModal, toggleTrackSelectionModal] = useState(false);
  const [loadedMidi, setLoadedMidi] = useState(midi);
  const [showCountdown, toggleCountdown] = useState(false);

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
              <Draggable bounds="parent" axis="x">
                <animated.div style={styles} className={playerController}>
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
            ))
          }
        </Transition>
      )}

      {isEmpty(midi) && !showCountdown && (
        <div className={loadFileWrapper}>
          <h3>
            You need to load a MIDI file and then <br /> select a track you want
            to play.
          </h3>

          <FileLoad
            onMidiLoad={data => {
              setLoadedMidi(data.data);
              toggleTrackSelectionModal(true);
            }}
            label={
              <div className={loadButton}>
                <Icon name="upload" color={colors.gray.darker} size={12} />
                &nbsp;&nbsp; Load a MIDI file
              </div>
            }
          />
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
            toggleCountdown(true);
            onTrackSelect(loadedMidi, i);
          }}
          onClose={() => {
            toggleTrackSelectionModal(false);
          }}
        />
      </div>

      {showCountdown && (
        <ProgressCircle
          onComplete={() => {
            toggleCountdown(false);
            toggleTrackSelectionModal(false);
            onStartPlay();
          }}
        />
      )}
    </animated.div>
  );
};

export default memo(PlayerController);
