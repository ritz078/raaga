import React, { useState, useEffect, memo, useCallback } from "react";
import { colors, Toast } from "@anarock/pebble";
import webMidi from "webmidi";
import {
  deviceAvailable,
  midiWrapper,
  noMidiIconWrapper
} from "@components/styles/MidiSelect.styles";
import { ReducersType } from "@enums/reducers";
import { SelectMenu, Pane, Icon } from "evergreen-ui";

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
  }, [webMidi]);

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
    <SelectMenu
      hasFilter={false}
      hasTitle={false}
      options={inputMidis.map(({ label, id }) => ({
        label,
        value: id
      }))}
      emptyView={
        <div className={midiWrapper}>
          <div className={noMidiIconWrapper}>
            <Icon name="midi" color={colors.gray.darker} size={26} />
          </div>
          {error ||
            "No device detected. Make sure your device is MIDI compatible and properly connected."}
        </div>
      }
      selected={midiDeviceId}
      onSelect={({ value }) => {
        dispatch({
          type: ReducersType.SET_MIDI_DEVICE,
          payload: value
        });
        Toast.show(
          `Connected to ${(webMidi.getInputById(value as string) as any).name}`,
          "success"
        );
      }}
    >
      <Pane display="inline-flex">
        <Icon
          icon="projects"
          color={"#fff"}
          size={22}
          cursor="pointer"
          marginX={15}
        />
        {!!inputMidis.length && (
          <Icon
            name="record"
            size={10}
            color={colors.green.base}
            className={deviceAvailable}
          />
        )}
      </Pane>
    </SelectMenu>
  );
};

export default memo(MidiSelect);
