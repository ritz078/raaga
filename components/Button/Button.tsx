import * as React from "react";
import cn from "@sindresorhus/class-names";

interface ButtonProps {
  children: React.ReactChild;
  onClick?: () => void;
  className?: string;
}

export const Button: React.FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  className
}) => {
  return (
    <button className={cn("button", className)} onClick={onClick}>
      {children}
    </button>
  );
};
