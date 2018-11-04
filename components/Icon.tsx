import React from "react";
import { colors } from "@anarock/pebble";
import { cx } from "emotion";

interface IconProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  size?: number;
  color?: string;
}

const Icon: React.SFC<IconProps> = ({
  name,
  size = 20,
  color = colors.white.base,
  className
}) => {
  return (
    <i
      className={cx(`icon icon-${name}`, className)}
      style={{
        fontSize: size,
        color
      }}
    />
  );
};

export default Icon;
