import React, { useState, useEffect, memo, useCallback } from "react";
import webMidi from "webmidi";
import { Icon } from "@components/Icon";
import { Dropdown } from "@components/Dropdown";
import cn from "@sindresorhus/class-names";

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
    <Dropdown
      position="right"
      label={() => (
        <Icon
          name="piano"
          color={"#fff"}
          size={16}
          className="mx-4 cursor-pointer"
        />
      )}
    >
      {close => (
        <div style={{ width: 180 }}>
          {inputMidis.length ? (
            inputMidis.map(({ label, id }) => {
              return (
                <div
                  className={cn("instrument-list", {
                    selected: id === midiDeviceId
                  })}
                  key={id}
                  onClick={() => {
                    onMidiDeviceChange(id);
                    close();
                  }}
                >
                  {label}
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-gray-100 text-xs select-none">
              <div className="flex justify-center mb-5 text-center">
                <Icon name="piano" color={"#fff"} size={26} />
              </div>
              {error ||
                "No device detected. Make sure your device is MIDI compatible and properly connected."}
            </div>
          )}
        </div>
      )}
    </Dropdown>
  );
};

export default memo(MidiSelect);
