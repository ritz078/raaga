import { Icon } from "evergreen-ui";
import React, { useContext, useEffect, useState } from "react";
import * as classNames from "./PlaybackSpeed.styles";
import Tone from "tone";
import { PlayerContext } from "@components/SoundPlayer";

const _PlaybackSpeed = function() {
  const [speed, setSpeed] = useState(1);
  const player = useContext(PlayerContext);

  const increase = () => {
    if (speed < 2) {
      setSpeed(speed + 0.1);
    }
  };

  const decrease = () => {
    if (speed > 0.1) {
      setSpeed(speed - 0.1);
    }
  };

  useEffect(() => {
    player.setSpeed(speed);
  }, [speed]);

  return (
    <div className={classNames.wrapper}>
      <div onClick={decrease} className={classNames.actionButton}>
        <Icon icon="minus" size={20} color="#fff" />
      </div>
      <span className={classNames.speedValue}>{Math.round(speed * 100)}</span>
      <div onClick={increase} className={classNames.actionButton}>
        <Icon icon="plus" size={20} color="#fff" />
      </div>
    </div>
  );
};

export const PlaybackSpeed = React.memo(_PlaybackSpeed);
