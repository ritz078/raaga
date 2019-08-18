import React, { FunctionComponent, memo } from "react";
import { progressBar } from "./styles/PlayerController.styles";

const ProgressBar: FunctionComponent<{ progress: number }> = ({ progress }) => {
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
