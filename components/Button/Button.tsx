import * as React from "react";
import { Icon } from "evergreen-ui";
import cn from "@sindresorhus/class-names";

interface ButtonProps {
  children: React.ReactChild;
  icon?: string;
  onClick?: () => void;
  iconProps?: any;
  className?: string;
}

export const Button: React.FunctionComponent<ButtonProps> = ({
  children,
  icon,
  onClick,
  iconProps,
  className
}) => {
  return (
    <div className={cn("button", className)} onClick={onClick}>
      {icon && <Icon size={13} marginRight={8} icon={icon} {...iconProps} />}
      {children}
    </div>
  );
};
