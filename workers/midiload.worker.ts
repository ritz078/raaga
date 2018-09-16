import { parse } from "midiconvert";

const file = new FileReader();

const _self = self as any;

file.onload = () => {
  try {
    const parsedMidi = parse(file.result);

    _self.postMessage({
      data: parsedMidi.toJSON()
    });
  } catch (e) {
    _self.postMessage({
      error: e.message
    });
  }
};

self.onmessage = e => {
  file.readAsArrayBuffer(e.data);
};
