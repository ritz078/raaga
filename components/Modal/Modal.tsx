import React, { memo, useEffect, useRef } from "react";
import * as ReactDOM from "react-dom";
import { useTransition, animated } from "react-spring";
import { useOnClickOutside } from "@hooks/useOnClickOutside";
import cn from "@sindresorhus/class-names";

interface ModalProps {
  visible: boolean;
  children: React.ReactChildren | React.ReactNode;
  onCloseRequest?: () => void;
  onCloseComplete?: () => void;
  contentClassName?: string;
}

function noop() {}

const node = document.createElement("div");

const _Modal: React.FunctionComponent<ModalProps> = ({
  visible,
  children,
  onCloseRequest = noop,
  onCloseComplete = noop,
  contentClassName
}) => {
  const ref = useRef(null);

  useEffect(() => {
    document.body.appendChild(node);

    return () => {
      try {
        document?.body?.removeChild(node);
      }catch (e) {
        
      }
    }
  }, []);

  const overlayTransition = useTransition(visible, null, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: {
      duration: 200
    }
  });

  const contentTransitions = useTransition(visible, null, {
    from: { opacity: 0, transform: "scale(0.8)" },
    enter: { opacity: 1, transform: "scale(1)" },
    leave: { opacity: 0, transform: "scale(0.8)" },
    config: {
      duration: 200
    },
    onDestroyed: isDestroyed => isDestroyed && onCloseComplete()
  });

  useOnClickOutside(ref, onCloseRequest);

  return ReactDOM.createPortal(
    overlayTransition.map(({ key, item, props }) =>
      item ? (
        <animated.div style={props as any} className="modal-overlay" key={key}>
          {contentTransitions.map(({ key, item, props }) =>
            item ? (
              <animated.div
                key={key}
                ref={ref}
                style={props as any}
                className={cn("modal", contentClassName)}
              >
                {children}
              </animated.div>
            ) : null
          )}
        </animated.div>
      ) : null
    ),
    node
  );
};

export const Modal = memo(_Modal);
