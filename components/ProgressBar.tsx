import React, { FunctionComponent, memo, useEffect, useState } from "react";
import Tone from "tone";
import { formatTime } from "@utils/formatTime";
import { css } from "emotion";

interface ProgressBarProps {
  duration: number;
}

export const progressBar = css({
  flex: 1,
  height: 6,
  borderRadius: 3,
  backgroundColor: "rgba(255, 255, 255, 0.4)",
  margin: "0 20px",
  minWidth: 200,
  overflow: "hidden",
  "& .__track__": {
    backgroundColor: "#42c9ff",
    height: "inherit",
    borderRadius: 3
  }
});

export const timeCn = css({ color: "#fff", display: "inline-flex", width: 50 });

const ProgressBar: FunctionComponent<ProgressBarProps> = ({ duration }) => {
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

export default memo(ProgressBar);
