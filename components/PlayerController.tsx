import React, { memo, useState } from "react";
import { animated, useTransition } from "react-spring";
import Icon from "@components/Icon";
import { colors } from "@anarock/pebble";
import ProgressBar from "@components/ProgressBar";
import {
  controllerBottom,
  midiNameStyle,
  playerController,
  playerWrapper
} from "@components/styles/PlayerController.styles";
import { isEmpty } from "lodash";
import Draggable from "react-draggable";
import { PlayerControllerProps } from "@components/typings/PlayerController";

const PlayerController: React.FunctionComponent<PlayerControllerProps> = ({
  midi,
  isPlaying,
  onTogglePlay,
  onStartPlay,
  style = {}
}) => {
  const [showTrackSelectionModal, toggleTrackSelectionModal] = useState(false);

  const transitions = useTransition(!showTrackSelectionModal, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0, pointerEvents: "none" }
  });

  return (
    <>
      <animated.div style={style} className={playerWrapper}>
        {!isEmpty(midi) &&
          transitions.map(
            ({ item, props, key }) =>
              item && (
                <Draggable bounds="parent" axis="x" key={key}>
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
                  </animated.div>
                </Draggable>
              )
          )}
      </animated.div>
    </>
  );
};

export default memo(PlayerController);
