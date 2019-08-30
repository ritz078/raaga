import React, { FunctionComponent, memo } from "react";
import iconUrl from "@assets/icons.svg";

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
}

const _Icon: FunctionComponent<IconProps> = ({
  name,
  size,
  color = "#fff",
  className,
  onClick
}) => {
  return (
    <svg
      fill={color}
      height={size}
      width={size}
      className={className}
      onClick={onClick}
    >
      <use href={`${iconUrl}#${name}`} />>
    </svg>
  );
};

export const Icon = memo(_Icon);
