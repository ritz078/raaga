import React, { memo } from "react";
import { modeBackground, modeToggleWrapper } from "./styles/ModeToggle.styles";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import { cx } from "emotion";

interface ModeToggleProps {
  mode: VISUALIZER_MODE;
  onToggle: (mode: VISUALIZER_MODE) => void;
  disabled: boolean;
}

const ModeToggle: React.FunctionComponent<ModeToggleProps> = ({
  mode,
  onToggle,
  disabled
}) => {
  const isWriteMode = mode === VISUALIZER_MODE.WRITE;

  const modeActiveBackground = cx(modeBackground, {
    __write__: isWriteMode
  });

  const wrapperCn = cx(modeToggleWrapper, {
    __disabled__: disabled
  });

  return (
    <div
      className={wrapperCn}
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
