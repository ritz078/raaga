import React, { useRef, memo } from "react";
import { promisifyWorker } from "@utils/promisifyWorker";
import { Button } from "@components/Button";
import sampleMidis from "../../midi.json";
import { IMidiJSON } from "@typings/midi";
import Nprogress from "nprogress";
import { Error } from "@components/Error";

let midiParseWorker;
if (IN_BROWSER) {
  const MidiParse = require("@workers/midiParse.worker");
  midiParseWorker = new MidiParse();
}

function Sidebar({ onMidiLoad }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = async e => {
    const file = e.target.files[0];
    Nprogress.start();
    try {
      const midi: IMidiJSON = await promisifyWorker(midiParseWorker, {
        filePath: file,
        name: file.name
      });
      onMidiLoad(midi);
    } catch (e) {
      Error.show(e);
    }
    if (inputRef.current) {
      // @ts-ignore
      inputRef.current.value = "";
    }
    Nprogress.done();
  };

  const selectSample = async ({ label, url }) => {
    Nprogress.start();
    const midi = await promisifyWorker(midiParseWorker, {
      filePath: url,
      name: label
    });
    onMidiLoad(midi);
    Nprogress.done();
  };

  return (
    <div className="tl-sidebar">
      <label htmlFor="upload-midi">
        <Button
          icon="browse"
          className="h-10 text-13"
          iconProps={{
            size: 15
          }}
        >
          Browse in Computer
        </Button>
      </label>
      <input
        onChange={loadFile}
        ref={inputRef}
        hidden
        type="file"
        name="photo"
        id="upload-midi"
        accept=".mid"
      />
      <div className="text-sm text-white pt-4 pb-1">Samples</div>
      {sampleMidis.map(sampleMidi => {
        return (
          <div
            key={sampleMidi.label}
            onClick={() => selectSample(sampleMidi)}
            className="tl-sidebar-sample-midi"
          >
            {sampleMidi.label.toLowerCase()}
          </div>
        );
      })}
    </div>
  );
}

export default memo(Sidebar);
