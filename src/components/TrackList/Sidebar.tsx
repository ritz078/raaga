import React, { useRef, memo } from "react";
import { Button } from "@components/Button";
import Nprogress from "nprogress";
import { Error } from "@components/Error";
import { getDetailsFromURL, getFileDetails } from "@utils/url";
import { Midi } from "@utils/Midi/Midi";
import Icon from "@mdi/react";
import { mdiFileUpload } from "@mdi/js";

function Sidebar({ onLoad, sampleMidis }: IProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = async (e) => {
    const file = e.target.files[0];
    Nprogress.start();
    try {
      const noteSequence = await getFileDetails(file);
      onLoad(noteSequence);
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
      const noteSequence = await getDetailsFromURL(url, label);
      onLoad(noteSequence);
    } catch (e) {
      Error.show(e.message);
    }
    Nprogress.done();
  };

  return (
    <div className="tl-sidebar">
      <label htmlFor="upload-midi">
        <Button className="h-10 text-13 w-full">
          <>
            <Icon path={mdiFileUpload} className="mr-2" size={0.7} />
            Load MIDI or MusicXML
          </>
        </Button>
      </label>
      <input
        onChange={loadFile}
        ref={inputRef}
        hidden
        type="file"
        name="photo"
        id="upload-midi"
        accept=".mid, .midi, .xml"
      />
      <div className="text-sm text-white pt-4 pb-1">Samples</div>
      {sampleMidis.map((sampleMidi) => {
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

interface IProps {
  onLoad: (noteSequence: Midi) => void;
  sampleMidis: { label: string; url: string }[];
}

export default memo(Sidebar);
