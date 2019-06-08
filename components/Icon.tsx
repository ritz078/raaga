import React from "react";
import { colors } from "@anarock/pebble";
import { css, cx } from "emotion";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

interface IconProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "unselectable"> {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

const Icon: React.FunctionComponent<IconProps> = ({
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
