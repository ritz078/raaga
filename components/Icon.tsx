import React from "react";
import { colors } from "@anarock/pebble";

interface IconProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  size?: number;
  color?: string;
}

const Icon: React.SFC<IconProps> = ({
  name,
  size = 20,
  color = colors.white.base
}) => {
  return (
    <i
      className={`icon icon-${name}`}
      style={{
        fontSize: size,
        color
      }}
    />
  );
};

export default Icon;
