import React, { useCallback, useState, memo } from "react";
import { colors, Option, OptionGroupRadio, Popper } from "@anarock/pebble";
import { ReducersType } from "@enums/reducers";
import { VISUALIZER_MODE } from "@enums/visualizerMessages";
import Tone from "tone";

import Icon from "@components/Icon";
import {
  headerClass,
  headerLogo,
  headerRight,
  iconNotifier,
  instrumentLabel,
  recordBtn
} from "./styles/Header.styles";
import ModeToggle from "./ModeToggle";
import { HeaderProps } from "./typings/Header";
import { getInstrumentByValue, instruments } from "midi-instruments";
import RecordingsSidebar from "@components/RecordingsSidebar";
import { Transition, animated } from "react-spring";
import MidiSelect from "@components/MidiSelect";

const Header: React.SFC<HeaderProps> = ({
  dispatch,
  mode,
  instrument,
  onInstrumentChange,
  isRecording,
  toggleRecording,
  recordings,
  onTrackSelect,
  midiDeviceId
}) => {
  const [mute, toggleMute] = useState(false);
  const [showRecordings, toggleRecordingsSidebar] = useState(false);

  const _toggleMute = useCallback(() => {
    Tone.Master.mute = !mute;
    toggleMute(!mute);
  });

  const toggleMode = useCallback((mode: VISUALIZER_MODE) =>
    dispatch({
      type: ReducersType.CHANGE_SETTINGS,
      payload: {
        mode
      }
    })
  );

  const volumeName = mute ? "volume-mute" : "volume";

  return (
    <header className={headerClass}>
      <span className={headerLogo}>🎹</span>

      <div className={headerRight}>
        <Transition
          native
          items={mode === VISUALIZER_MODE.WRITE}
          from={{ opacity: 0 }}
          enter={{ opacity: 1 }}
          leave={{ opacity: 0, pointerEvents: "none" }}
        >
          {show =>
            show &&
            (styles => (
              <animated.button
                style={styles}
                className={recordBtn}
                onClick={toggleRecording}
              >
                <Icon
                  name={isRecording ? "stop" : "record"}
                  size={12}
                  color={colors.red.base}
                />
                &nbsp;&nbsp;&nbsp;
                {isRecording ? "Stop" : "Record"}
              </animated.button>
            ))
          }
        </Transition>

        <ModeToggle mode={mode} onToggle={toggleMode} />

        <Popper
          label={({ toggle, isOpen }) => (
            <div className={instrumentLabel} onClick={toggle}>
              {getInstrumentByValue(instrument).name}{" "}
              <span className={isOpen ? "__open__" : undefined}>▼</span>
            </div>
          )}
          placement="bottom"
        >
          {({ toggle }) => (
            <OptionGroupRadio
              onChange={value => {
                onInstrumentChange(value);
                toggle();
              }}
              selected={instrument}
            >
              {Object.keys(instruments).map(id => {
                const { value, name } = instruments[id];
                return <Option key={value} value={value} label={name} />;
              })}
            </OptionGroupRadio>
          )}
        </Popper>
        <div>
          <Icon
            className="icon-padding"
            name={volumeName}
            color={colors.white.base}
            onClick={_toggleMute}
          />
        </div>
        <div>
          {!!recordings.length && (
            <span className={iconNotifier}>{recordings.length}</span>
          )}
          <Icon
            onClick={() => toggleRecordingsSidebar(true)}
            className="icon-padding"
            name="tracks"
            color={colors.white.base}
          />
        </div>

        <MidiSelect dispatch={dispatch} midiDeviceId={midiDeviceId} />
        <RecordingsSidebar
          visible={showRecordings}
          onClose={() => toggleRecordingsSidebar(false)}
          recordings={recordings}
          dispatch={dispatch}
          onTrackSelect={onTrackSelect}
        />
      </div>
    </header>
  );
};

export default memo(Header);
