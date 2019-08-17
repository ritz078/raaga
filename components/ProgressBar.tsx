import React, { FunctionComponent, useEffect, useState, memo } from "react";
import { progressBar } from "./styles/PlayerController.styles";
import Tone from "tone";

const ProgressBar: FunctionComponent<{}> = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress(Tone.Transport.seconds / Tone.Transport.duration);
    });

    return function cleanup() {
      clearInterval(id);
    };
  }, []);

  return (
    <div className={progressBar}>
      <div
        className={"__track__"}
        style={{
          width: `${progress * 100}%`
        }}
      />
    </div>
  );
};

export default memo(ProgressBar);
