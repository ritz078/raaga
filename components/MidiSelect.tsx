import React, { useState, useCallback, useEffect, memo } from "react";
import { colors, Popper, Option, OptionGroupRadio } from "@anarock/pebble";
import Icon from "@components/Icon";
import webMidi from "webmidi";
import {
  midiWrapper,
  noMidiIconWrapper
} from "@components/styles/MidiSelect.styles";

const MidiSelect = () => {
  const [inputMidis, setInputMidis] = useState([]);
  const [error, setError] = useState("");

  const handleMidiDeviceChange = useCallback(() => {
    setInputMidis(webMidi.inputs);
  });

  useEffect(() => {
    let enabled = false;
    webMidi.enable(err => {
      if (err) {
        setError(err.message);
      } else {
        enabled = true;
        setInputMidis(webMidi.inputs);

        webMidi.addListener("connected", handleMidiDeviceChange);
        webMidi.addListener("disconnected", handleMidiDeviceChange);
      }
    });

    return () => {
      if (enabled) {
        webMidi.removeListener("connected", handleMidiDeviceChange);
        webMidi.removeListener("disconnected", handleMidiDeviceChange);
      }
    };
  }, []);

  return (
    <Popper
      label={({ toggle }) => (
        <Icon className="icon-padding" name="midi" onClick={toggle} />
      )}
      placement="bottom-end"
      isOpen
    >
      {() =>
        inputMidis.length ? (
          <OptionGroupRadio onChange={console.log} selected={""}>
            {webMidi.inputs.map(input => (
              <Option label={input.name} value={input.name} />
            ))}
          </OptionGroupRadio>
        ) : (
          <div className={midiWrapper}>
            <div className={noMidiIconWrapper}>
              <Icon name="midi" color={colors.gray.darker} size={26} />
            </div>
            {error ||
              "No device detected. Make sure your device is MIDI compatible and properly connected."}
          </div>
        )
      }
    </Popper>
  );
};

export default memo(MidiSelect);
