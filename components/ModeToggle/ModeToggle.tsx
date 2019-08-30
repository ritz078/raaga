import React, { memo } from "react";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import cn from "@sindresorhus/class-names";

interface ModeToggleProps {
  mode: VISUALIZER_MODE;
  onToggle: (mode: VISUALIZER_MODE) => void;
  disabled: boolean;
}

const _ModeToggle: React.FunctionComponent<ModeToggleProps> = ({
  mode,
  onToggle,
  disabled
}) => {
  const isWriteMode = mode === VISUALIZER_MODE.WRITE;

  const modeActiveBackground = cn("mode-toggle-background", {
    __write__: isWriteMode
  });

  const wrapperCn = cn("mode-toggle-wrapper", {
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

export const ModeToggle = memo(_ModeToggle);
