import React, { useState, useEffect, memo, useCallback } from "react";
import webMidi from "webmidi";
import { Dropdown } from "@components/Dropdown";
import cn from "@sindresorhus/class-names";
import Icon from "@mdi/react";
import { mdiPiano } from "@mdi/js";

const _MidiSelect = ({ onMidiDeviceChange, midiDeviceId }) => {
  const [inputMidis, setInputMidis] = useState([]);
  const [error, setError] = useState("");

  const handleMidiDeviceChange = useCallback(() => {
    setInputMidis(webMidi.inputs);

    if (!webMidi.inputs.length) {
      onMidiDeviceChange(null);
    }
  }, [webMidi]);

  useEffect(() => {
    if (!webMidi.supported) {
      setError("Your Device doesn't support the WebMIDI API.");
      return;
    }

    setInputMidis(webMidi.inputs);

    webMidi.addListener("connected", handleMidiDeviceChange);
    webMidi.addListener("disconnected", handleMidiDeviceChange);
    return () => {
      webMidi.removeListener("connected", handleMidiDeviceChange);
      webMidi.removeListener("disconnected", handleMidiDeviceChange);
    };
  }, []);

  return (
    <Dropdown
      position="right"
      contentClassName="instrument-selector"
      label={() => (
        <>
          <Icon
            path={mdiPiano}
            color={"#fff"}
            size={1}
            className="mx-4 cursor-pointer"
          />
          {!!inputMidis.length && (
            <div className="midi-select-inputs-available" />
          )}
        </>
      )}
    >
      {close => (
        <div style={{ width: 180 }}>
          {inputMidis.length ? (
            inputMidis.map(({ name, id }) => {
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
                  {name}
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-gray-100 text-xs select-none">
              <div className="flex justify-center mb-5 text-center">
                <Icon path={mdiPiano} color={"#fff"} size={2} />
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

export const MidiSelect = memo(_MidiSelect);
