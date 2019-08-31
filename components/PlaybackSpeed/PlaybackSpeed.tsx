import { Icon } from "evergreen-ui";
import React, { useContext, useEffect, useState } from "react";
import { PlayerContext } from "@components/SoundPlayer";
import { Button } from "@components/Button";

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
      <div className="text-gray-500 text-xs mr-4">Speed</div>
      <Button onClick={decrease} className="playback-speed-btn">
        <Icon icon="minus" size={15} color="#fff" />
      </Button>
      <span className="block text-xs text-center w-12">
        {Math.round(speed * 100)}%
      </span>
      <Button onClick={increase} className="playback-speed-btn">
        <Icon icon="plus" size={15} color="#fff" />
      </Button>
    </div>
  );
};

export const PlaybackSpeed = React.memo(_PlaybackSpeed);
