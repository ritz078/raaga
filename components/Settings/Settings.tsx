import React, { memo, useState, useContext, FunctionComponent } from "react";
import { Icon } from "@components/Icon";
import { Modal } from "@components/Modal";
import { ChromePicker } from "react-color";
import { Dropdown } from "@components/Dropdown";
import { Theme } from "@utils/typings/Theme";
import { ThemeContext } from "@utils/ThemeContext";

interface SettingsProps {
  onThemeChange: (theme: Theme) => void;
}

const _Settings: FunctionComponent<SettingsProps> = ({ onThemeChange }) => {
  const [visible, setVisibility] = useState(false);
  const theme = useContext(ThemeContext);
  return (
    <div>
      <Icon
        name="settings"
        color={"#fff"}
        size={18}
        className="mx-4 cursor-pointer"
        onClick={() => setVisibility(!visible)}
      />

      <Modal onCloseRequest={() => setVisibility(false)} visible={visible}>
        <div className="settings-content p-4">
          <div className="settings-section-title">Colors</div>
          {[
            { colorName: "naturalColor", label: "White Keys" },
            { colorName: "accidentalColor", label: "Black Keys" }
          ].map(({ label, colorName }) => (
            <div key={colorName} className="settings-row">
              <span className="settings-row-label">{label}</span>
              <Dropdown
                label={() => (
                  <div
                    className="rounded-sm cursor-pointer"
                    style={{
                      height: 20,
                      width: 20,
                      backgroundColor: theme[colorName]
                    }}
                  ></div>
                )}
              >
                {() => (
                  <ChromePicker
                    color={theme[colorName]}
                    disableAlpha
                    onChange={color =>
                      onThemeChange({
                        ...theme,
                        [colorName]: color.hex
                      })
                    }
                  />
                )}
              </Dropdown>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default memo(_Settings);
