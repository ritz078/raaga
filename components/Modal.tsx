import React from "react";
import Modal_ from "react-modal";
import { colors } from "@anarock/pebble";

const styles = {
  overlay: {
    zIndex: 99,
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  content: {
    backgroundColor: colors.white.base,
    border: 0,
    width: 500,
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "auto",
    top: 100,
    padding: 30
  }
};

const Modal = ({ children, visible }) => {
  return (
    <Modal_
      ariaHideApp={false}
      closeTimeoutMS={500}
      isOpen={visible}
      style={styles}
    >
      {children}
    </Modal_>
  );
};

export default Modal;
