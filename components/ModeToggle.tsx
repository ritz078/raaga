import React, { memo } from "react";
import { modeBackground, modeToggleWrapper } from "./styles/ModeToggle.styles";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import { cx } from "emotion";

const ModeToggle: React.SFC<{
  mode: VISUALIZER_MODE;
  onToggle: (mode: VISUALIZER_MODE) => void;
}> = ({ mode, onToggle }) => {
  const isWriteMode = mode === VISUALIZER_MODE.WRITE;

  const modeActiveBackground = cx(modeBackground, {
    __write__: isWriteMode
  });

  return (
    <div
      className={modeToggleWrapper}
      onClick={() =>
        onToggle(isWriteMode ? VISUALIZER_MODE.READ : VISUALIZER_MODE.WRITE)
      }
    >
      <div className={modeActiveBackground} />
      <div>Read</div>
      <div>Write</div>
    </div>
  );
};

export default memo(ModeToggle);
