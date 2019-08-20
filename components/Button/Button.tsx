import * as styles from "./Button.styles";
import * as React from "react";
import { Icon } from "evergreen-ui";
import { cx } from "emotion";

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
    <div className={cx(styles.uploadButton, className)} onClick={onClick}>
      {icon && <Icon size={13} marginRight={8} icon={icon} {...iconProps} />}
      {children}
    </div>
  );
};
