import React, { useRef, memo } from "react";
import { Button } from "@components/Button";
import sampleMidis from "../../midi.json";
import Nprogress from "nprogress";
import { Error } from "@components/Error";
import * as Comlink from "comlink";
import MidiParseWorker from "@workers/midiParse.worker";
import { getFileDetails } from "@utils/url";

const midiParseWorker: any = Comlink.wrap(new MidiParseWorker());

function Sidebar({ onMidiLoad }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = async e => {
    const file = e.target.files[0];
    Nprogress.start();
    try {
      const midi = await getFileDetails(file)
      onMidiLoad(midi);
    } catch (e) {
      Error.show(e.message);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    Nprogress.done();
  };

  const selectSample = async ({ label, url }) => {
    Nprogress.start();
    try {
      const midi = await midiParseWorker(url, label);
      onMidiLoad(midi);
    } catch (e) {
      Error.show(e.message);
    }
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
          Local MIDI File
        </Button>
      </label>
      <input
        onChange={loadFile}
        ref={inputRef}
        hidden
        type="file"
        name="photo"
        id="upload-midi"
        accept=".mid, .midi, .xml, .mei, .krn"
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
