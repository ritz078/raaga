import React from "react";
import { colors } from "@anarock/pebble";
import { css, cx } from "emotion";

interface IconProps extends React.HTMLAttributes<HTMLElement> {
  name: string;
  size?: number;
  color?: string;
}

const Icon: React.SFC<IconProps> = ({
  name,
  size = 20,
  color = colors.white.base,
  className,
  style = {},
  ...props
}) => {
  return (
    <i
      className={cx(
        `icon icon-${name}`,
        css({
          ...style,
          fontSize: size,
          color
        }),
        className
      )}
      {...props}
    />
  );
};

export default Icon;
