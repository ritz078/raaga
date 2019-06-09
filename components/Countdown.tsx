import React, { FunctionComponent, useEffect, useState } from "react";
import Circle from "react-progress-arc";
import { colors } from "@anarock/pebble";
import { css } from "emotion";

const wrapperCn = css({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 60
});

const countClassName = css({
  position: "absolute",
  color: colors.white.base
});

interface CountdownProps {
  onComplete: () => void;
}

export const Countdown: FunctionComponent<CountdownProps> = ({
  onComplete = () => {}
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const x = setInterval(() => {
      setProgress(progress - 0.1);
      if (progress <= 0) {
        onComplete();
      }
    }, 1);

    return () => {
      clearInterval(x);
    };
  });

  return (
    <div className={wrapperCn}>
      <div className={countClassName}>{Math.ceil((progress * 5) / 100)}</div>
      <Circle
        stroke={colors.white.base}
        completed={progress / 100}
        strokeWidth={4}
        diameter={150}
      />
    </div>
  );
};
