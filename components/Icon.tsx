import React from "react";
import { colors } from "@anarock/pebble";
import { cx } from "emotion";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

interface IconProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "unselectable"> {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

const Icon: React.SFC<IconProps> = ({
  name,
  size = 20,
  color = colors.white.base,
  className,
  ...props
}) => {
  return (
    <span
      className={cx(`icon icon-${name}`, className)}
      style={{
        fontSize: size,
        color
      }}
      {...props}
    />
  );
};

export default Icon;
