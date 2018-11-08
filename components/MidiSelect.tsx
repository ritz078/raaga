// @ts-ignore
import React, { useState, useCallback, useEffect, memo } from "react";
import {
  colors,
  Popper,
  Option,
  OptionGroupRadio,
  Toast
} from "@anarock/pebble";
import Icon from "@components/Icon";
import webMidi from "webmidi";
import {
  deviceAvailable,
  midiWrapper,
  noMidiIconWrapper
} from "@components/styles/MidiSelect.styles";
import { ReducersType } from "@enums/reducers";
import { css } from "emotion";

const MidiSelect = ({ dispatch, midiDeviceId }) => {
  const [inputMidis, setInputMidis] = useState([]);
  const [error, setError] = useState("");

  const handleMidiDeviceChange = useCallback(() => {
    setInputMidis(webMidi.inputs);

    if (!webMidi.inputs.length) {
      dispatch({
        type: ReducersType.SET_MIDI_DEVICE,
        payload: null
      });
    }
  });

  useEffect(() => {
    let enabled = false;

    if (!webMidi.supported) {
      setError("Your Device doesn't support the WebMIDI API.");
    }

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
        <div>
          <Icon className="icon-padding" name="midi" onClick={toggle} />
          {inputMidis.length && (
            <Icon
              name="record"
              size={10}
              color={colors.green.base}
              className={deviceAvailable}
            />
          )}
        </div>
      )}
      placement="bottom-end"
      popperClassName={css({
        width: 300
      })}
    >
      {({ toggle }) =>
        inputMidis.length ? (
          <OptionGroupRadio
            onChange={id => {
              dispatch({
                type: ReducersType.SET_MIDI_DEVICE,
                payload: id
              });
              Toast.show(
                // @ts-ignore
                `Connected to ${webMidi.getInputById(id as string).name}`,
                "success"
              );
              toggle();
            }}
            selected={midiDeviceId}
          >
            {inputMidis.map(input => (
              <Option
                key={input.id}
                label={input.name}
                value={input.id}
                rightElement={() =>
                  input.id === midiDeviceId ? (
                    <Icon name="record" size={14} color={colors.green.base} />
                  ) : null
                }
              />
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
