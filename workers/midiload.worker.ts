// This is possible due to the usage of worker-loader in webpack.
// You can't do this without that. Only importScripts works.
import { parse } from "midiconvert";

const file = new FileReader();

const _self = self as any;

file.onload = () => {
  try {
    // heavy computation
    const parsedMidi = parse(file.result);

    _self.postMessage({
      data: parsedMidi.toJSON()
    });
  } catch (e) {
    debugger;
    _self.postMessage({
      error: e.message
    });
  }
};

self.onmessage = e => {
  file.readAsArrayBuffer(e.data);
};
