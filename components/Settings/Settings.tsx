import React, { memo, useState } from "react";
import { Icon } from "@components/Icon";
import { Modal } from "@components/Modal";
import { TwitterPicker } from "react-color";
import { Dropdown } from "@components/Dropdown";

const _Settings = () => {
  const [visible, setVisibility] = useState(false);

  return (
    <div>
      <Icon
        name="settings"
        color={"#fff"}
        size={18}
        className="mx-4 cursor-pointer"
        onClick={() => setVisibility(!visible)}
      />

      <Modal onClose={() => setVisibility(false)} visible={true}>
        <div className="settings-content p-4">
          <div className="settings-section-title">COLORS</div>

          <div className="settings-row">
            <span className="settings-row-label">Accidental Keys</span>
            <Dropdown
              label={() => (
                <div
                  className="rounded-sm cursor-pointer"
                  style={{ height: 20, width: 20, backgroundColor: "green" }}
                ></div>
              )}
            >
              {() => <TwitterPicker />}
            </Dropdown>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default memo(_Settings);
