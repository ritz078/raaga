import React, { FunctionComponent } from "react";
import { Circle } from "rc-progress";
import { colors } from "@anarock/pebble";
import { useSpring } from "react-spring";

interface CountdownProps {
  onComplete: () => void;
}

export const Countdown: FunctionComponent<CountdownProps> = ({
  onComplete
}) => {
  const { number } = useSpring({
    number: 0,
    from: { number: 1 },
    onRest: onComplete
  });

  return (
    <Circle
      strokeColor={colors.white.base}
      percent={number * 100}
      style={{
        width: 200
      }}
    />
  );
};
