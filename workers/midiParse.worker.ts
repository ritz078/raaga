import { MidiParser } from "@utils/MidiParser";
import * as Comlink from "comlink";

// This file is too big to be bundled in the application. Every time, we try
// to bundle this, node collapses. So we are loading this file as a static file.
importScripts(`${location.origin}/vendor/verovio.js`);

const _self = self as any;

const vrv = new self["verovio"].toolkit();

function base64ToArrayBuffer(base64) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

function isNotMidi(fileName: string) {
  return (
    fileName.endsWith(".xml") ||
    fileName.endsWith(".mei") ||
    fileName.endsWith(".krn")
  );
}

export const parseMidi = async (filePath, name) => {
  const url =
    typeof filePath === "string"
      ? _self.location.origin + filePath
      : URL.createObjectURL(filePath);

  const res = await fetch(url);

  let arrayBuffer;
  if (isNotMidi(filePath === "string" ? filePath : name)) {
    const text = await res.text();
    vrv.loadData(text);
    const base64Midi = vrv.renderToMIDI();

    arrayBuffer = base64ToArrayBuffer(base64Midi);
  } else {
    arrayBuffer = await res.arrayBuffer();
  }

  const midi = new MidiParser(arrayBuffer, name);
  return midi.parse();
};

Comlink.expose(parseMidi);
