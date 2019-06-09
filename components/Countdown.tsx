import React, { FunctionComponent, useEffect, useState } from "react";
import Circle from "react-progress-arc";
import { colors } from "@anarock/pebble";
import { css, cx } from "emotion";

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
  onComplete?: () => void;
  className?: string;
}

export const Countdown: FunctionComponent<CountdownProps> = ({
  onComplete = () => {},
  className
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const x = setInterval(() => {
      setProgress(progress - 0.3);
      if (progress <= 5) {
        onComplete();
      }
    }, 1);

    return () => {
      clearInterval(x);
    };
  });

  return (
    <div className={cx(wrapperCn, className)}>
      <div className={countClassName}>{Math.ceil((progress * 3) / 100)}</div>
      <Circle
        stroke={colors.white.base}
        completed={progress / 100}
        strokeWidth={4}
        diameter={150}
      />
    </div>
  );
};
