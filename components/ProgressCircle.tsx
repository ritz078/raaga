import React from "react";
import { Spring } from "react-spring";
import { colors } from "@anarock/pebble";
import Progress from "react-progress-arc";
import {
  progressCircle,
  progressWrapper
} from "./styles/ProgressCircle.styles";

interface ProgressCircleProps {
  onComplete: () => void;
}

const config = {
  duration: 4000
};

const ProgressCircle: React.SFC<ProgressCircleProps> = ({ onComplete }) => {
  return (
    <Spring
      from={{ number: 0 }}
      to={{ number: 1 }}
      config={config}
      onRest={onComplete}
    >
      {({ number }) => {
        return (
          <div className={progressWrapper}>
            <div className={progressCircle}>{3 - Math.round(number * 3)}</div>
            <Progress
              diameter={200}
              strokeWidth={4}
              stroke={colors.white.base}
              completed={number}
            />
          </div>
        );
      }}
    </Spring>
  );
};

export default ProgressCircle;
