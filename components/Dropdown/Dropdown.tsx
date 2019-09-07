import React, { FunctionComponent, memo, useRef, useState } from "react";
import { useTransition, animated } from "react-spring";
import { useOnClickOutside } from "@hooks/useOnClickOutside";
import cn from "@sindresorhus/class-names";

interface DropdownProps {
  label: (isOpen: boolean) => React.ReactNode;
  isOpen?: boolean;
  contentClassName?: string;
  children: (close: () => void) => React.ReactNode;
  position?: "left" | "right";
}

const _Dropdown: FunctionComponent<DropdownProps> = ({
  label,
  isOpen = false,
  contentClassName,
  children,
  position = "start"
}) => {
  const [isVisible, setVisible] = useState(isOpen);
  const contentRef = useRef(null);
  const transitions = useTransition(isVisible, null, {
    from: { opacity: 0, transform: "translateY(8px)" },
    enter: { opacity: 1, transform: "translateY(0)" },
    leave: { opacity: 0, transform: "translateY(8px)" },
    config: {
      duration: 200
    }
  });

  useOnClickOutside(contentRef, () => setVisible(false));

  return (
    <div className="relative" ref={contentRef}>
      <div onClick={() => setVisible(!isVisible)}>{label(isVisible)}</div>

      {transitions.map(
        ({ key, item, props }) =>
          item && (
            <animated.div
              style={props}
              key={key}
              className={cn(
                "dropdown-content",
                {
                  right: position === "right"
                },
                contentClassName
              )}
            >
              {children(() => setVisible(false))}
            </animated.div>
          )
      )}
    </div>
  );
};

export const Dropdown = memo(_Dropdown);
