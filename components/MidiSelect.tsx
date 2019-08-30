import React, { useState, useEffect, memo, useCallback } from "react";
import webMidi from "webmidi";
import { SelectMenu, Pane, Icon } from "evergreen-ui";

const MidiSelect = ({ onMidiDeviceChange, midiDeviceId }) => {
  const [inputMidis, setInputMidis] = useState([]);
  const [error, setError] = useState("");

  const handleMidiDeviceChange = useCallback(() => {
    setInputMidis(webMidi.inputs);

    if (!webMidi.inputs.length) {
      onMidiDeviceChange(null);
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
        <div className="p-8 bg-white rounded text-center text-gray-700 text-xs select-none">
          <div className="flex justify-center mb-5 text-center">
            <Icon name="midi" color={"#101721"} size={26} />
          </div>
          {error ||
            "No device detected. Make sure your device is MIDI compatible and properly connected."}
        </div>
      }
      selected={midiDeviceId}
      onSelect={({ value }) => {
        onMidiDeviceChange(value);
        console.log(
          `Connected to ${(webMidi.getInputById(value as string) as any).name}`
        );
      }}
    >
      <Pane display="inline-flex">
        <Icon
          icon="projects"
          color={"#fff"}
          size={16}
          cursor="pointer"
          marginX={15}
        />
      </Pane>
    </SelectMenu>
  );
};

export default memo(MidiSelect);
