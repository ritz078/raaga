import * as styles from "./TrackList.styles";
import * as React from "react";
import { useRef } from "react";
import { promiseWorker } from "@utils/promiseWorker";
import { MidiJSON } from "@utils/midiParser/midiParser";
import { Button } from "@components/Button";

let midiParseWorker;
if (IN_BROWSER) {
  const MidiParse = require("@workers/midiParse.worker");
  midiParseWorker = new MidiParse();
}

function Sidebar({ onMidiLoad }) {
  const inputRef = useRef();

  const loadFile = async e => {
    const file = e.target.files[0];
    const midi: MidiJSON = await promiseWorker(midiParseWorker, {
      filePath: file
    });
    onMidiLoad(midi);
    if (inputRef.current) {
      // @ts-ignore
      inputRef.current.value = "";
    }
  };

  return (
    <div className={styles.sidebar}>
      <label htmlFor="upload-midi">
        <Button icon="upload">Browse in Computer</Button>
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
    </div>
  );
}

export default React.memo(Sidebar);
