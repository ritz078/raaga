import React, { FunctionComponent, memo, useEffect, useState } from "react";
import Tone from "tone";
import { formatTime } from "@utils/formatTime";
import { progressBar, timeCn } from "./ProgressBar.styles";

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
      <div className={progressBar}>
        <div
          className={"__track__"}
          style={{
            width: `${progress * 100}%`
          }}
        />
      </div>
      <span className={timeCn}>{formatTime((1 - progress) * duration)}</span>
    </>
  );
};

export const ProgressBar = memo(_ProgressBar);
