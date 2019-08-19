import React, { FunctionComponent, memo, useEffect, useState } from "react";
import { progressBar, timeCn } from "./styles/PlayerController.styles";
import Tone from "tone";
import { padStart } from "lodash";

function format(timeInSeconds: number) {
  const hours = Math.floor(timeInSeconds / (60 * 60)) || 0;
  const minutes = Math.floor((timeInSeconds - 60 * 60 * hours) / 60) || 0;
  const seconds =
    Math.floor(timeInSeconds - 60 * 60 * hours - 60 * minutes) || 0;

  const _hr = padStart(hours.toString(10), 2, "0");
  const _min = padStart(minutes.toString(10), 2, "0");
  const _sec = padStart(seconds.toString(10), 2, "0");
  return hours ? `${_hr}:${_min}:${_sec}` : `${_min}:${_sec}`;
}

const ProgressBar: FunctionComponent<{ duration: number }> = ({ duration }) => {
  const [progress, setProgress] = useState(0.3);
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
      <span className={timeCn}>{format((1 - progress) * duration)}</span>
    </>
  );
};

export default memo(ProgressBar);
