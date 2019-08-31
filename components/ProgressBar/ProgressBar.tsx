import React, { FunctionComponent, memo, useEffect, useState } from "react";
import Tone from "tone";
import { formatTime } from "@utils/formatTime";

interface ProgressBarProps {
  duration: number;
}

const _ProgressBar: FunctionComponent<ProgressBarProps> = ({ duration }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const intervalId = setInterval(
      () => setProgress(Tone.Transport.seconds / duration),
      500
    );

    return () => clearInterval(intervalId);
  }, [duration]);

  return (
    <>
      <div className="progress-bar">
        <div
          style={{
            width: `${progress * 100}%`
          }}
        />
      </div>
      <span className="text-white inline-flex w-8 text-xs">
        {formatTime((1 - progress) * duration)}
      </span>
    </>
  );
};

export const ProgressBar = memo(_ProgressBar);
