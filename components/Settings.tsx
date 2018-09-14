import * as React from "react";
import {
  labelClass,
  popperClass,
  settingsWrapper
} from "./styles/Settings.styles";
import { Popper, OptionGroupRadio, Option, utils } from "@anarock/pebble";
// @ts-ignore
import instruments from "soundfont-player/instruments.json";
import { SettingsProps } from "./typings/Settings";
import Recorder from "@components/Recorder";

export default class Settings extends React.PureComponent<SettingsProps> {
  clean = (str: string) => {
    return utils.capitalize(str.replace(/_/g, " "));
  };

  render() {
    const { instrument = instruments[0], onRecordingEnd, onRecordingStart, onInstrumentChange } = this.props;

    return (
      <div className={settingsWrapper}>
        <Popper
          label={({ toggle }) => (
            <span className={labelClass} onClick={toggle}>
              {this.clean(instrument)} &nbsp;
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
                <Option key={name} value={name} label={this.clean(name)} />
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
}
