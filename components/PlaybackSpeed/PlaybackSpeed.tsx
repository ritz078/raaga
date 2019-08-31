import { Icon } from "evergreen-ui";
import React, { useContext, useEffect, useState } from "react";
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
    <div className="playback-speed-wrapper">
      <div onClick={decrease} className="playback-speed-btn">
        <Icon icon="minus" size={20} color="#fff" />
      </div>
      <span className="block text-xs text-center w-11">
        {Math.round(speed * 100)}%
      </span>
      <div onClick={increase} className="playback-speed-btn">
        <Icon icon="plus" size={20} color="#fff" />
      </div>
    </div>
  );
};

export const PlaybackSpeed = React.memo(_PlaybackSpeed);
