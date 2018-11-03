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
      from={{ number: 3 }}
      to={{ number: 0 }}
      config={config}
      onRest={onComplete}
    >
      {({ number }) => {
        return (
          <div className={progressWrapper}>
            <div className={progressCircle}>{Math.round(number)}</div>
            <Progress
              diameter={200}
              strokeWidth={4}
              stroke={colors.white.base}
              completed={(4 - number) / number}
            />
          </div>
        );
      }}
    </Spring>
  );
};

export default ProgressCircle;
