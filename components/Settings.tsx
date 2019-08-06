import * as React from "react";
import {
  labelClass,
  popperClass,
  settingsWrapper
} from "./styles/Settings.styles";
import { Option, OptionGroupRadio, Popper, utils } from "@anarock/pebble";
import instruments from "soundfont-player/instruments.json";
import { SettingsProps } from "./typings/Settings";
import Recorder from "@components/Recorder";

function clean(str: string) {
  return utils.capitalize(str.replace(/_/g, " "));
}

export default function Settings(props: SettingsProps) {
  const {
    instrument = instruments[0],
    onRecordingEnd,
    onRecordingStart,
    onInstrumentChange
  } = props;

  return (
    <div className={settingsWrapper}>
      <Popper
        label={({ toggle }) => (
          <span className={labelClass} onClick={toggle}>
            {clean(instrument)} &nbsp;
            <span style={{ fontSize: 8 }}>▶</span>
          </span>
        )}
        placement="auto"
        popperClassName={popperClass}
      >
        {({ toggle }) => (
          <OptionGroupRadio
            onChange={id => {
              id && onInstrumentChange(id as string);
              toggle();
            }}
            selected={instrument}
          >
            {instruments.map(name => (
              <Option key={name} value={name} label={clean(name)} />
            ))}
          </OptionGroupRadio>
        )}
      </Popper>

      <Recorder
        onRecordingEnd={onRecordingEnd}
        onRecordingStart={onRecordingStart}
      />
    </div>
  );
}
