import React, { useEffect, memo } from "react";
import MidiLoadWorker from "@workers/midiload.worker";

let worker: Worker;

const fileRef: React.RefObject<HTMLInputElement> = React.createRef();
const FileLoad = ({ onMidiLoad, label }) => {
  useEffect(() => {
    if (!worker) {
      worker = new MidiLoadWorker();
      worker.onmessage = e => {
        if (e.data.error) {
          alert(e.data.error);
          return;
        }

        onMidiLoad(e.data);
      };
    }
  }, []);

  function loadFile(e) {
    const file = e.target.files[0];
    worker.postMessage(file);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  return (
    <>
      <label htmlFor="upload-midi" style={{ display: "flex" }}>
        {label}
      </label>
      <input
        onChange={loadFile}
        hidden
        type="file"
        name="photo"
        id="upload-midi"
        accept=".mid"
        ref={fileRef}
      />
    </>
  );
};

export default memo(FileLoad);
