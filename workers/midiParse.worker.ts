import { MidiParser } from "@utils/MidiParser";
import * as Comlink from "comlink";

const _self = self as any;

export const parseMidi = async (filePath, name) => {
  const url =
    typeof filePath === "string"
      ? _self.location.origin + filePath
      : URL.createObjectURL(filePath);

  const res = await fetch(url);

  const arrayBuffer = await res.arrayBuffer();
  const midi = new MidiParser(arrayBuffer, name);
  return midi.parse();
};

Comlink.expose(parseMidi);
