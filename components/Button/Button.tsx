import * as React from "react";
import cn from "@sindresorhus/class-names";
import { Icon } from "@components/Icon";

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
      {icon && <Icon size={13} className="mr-2" name={icon} {...iconProps} />}
      {children}
    </div>
  );
};
