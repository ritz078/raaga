import React, { useEffect, useState } from "react";
import Mitt from "mitt";
import { useTransition, animated } from "react-spring";

const emitter = new Mitt();

export function Error() {
  const [text, setText] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer = null;

    const hideToast = () => {
      setShow(false);
    };

    const showToast = text => {
      setText(text);
      setShow(true);

      clearTimeout(timer);
      timer = setTimeout(hideToast, 5000);
    };

    emitter.on("showToast", showToast);
    emitter.on("hideToast", hideToast);

    return () => {
      emitter.off("showToast", showToast);
      emitter.off("hideToast", hideToast);
    };
  }, []);

  const transitions = useTransition(show, null, {
    enter: { opacity: 1 },
    leave: { opacity: 0, pointerEvents: "none" }
  });

  return (
    <>
      {transitions.map(
        ({ item, key, props }) =>
          item && (
            <animated.div
              key={key}
              style={props as any}
              className="error-toast"
            >
              {text}
            </animated.div>
          )
      )}
    </>
  );
}

Error.show = (text: string) => emitter.emit("showToast", text);

Error.hide = () => emitter.emit("hideToast");
