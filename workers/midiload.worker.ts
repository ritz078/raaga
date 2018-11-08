// This is possible due to the usage of worker-loader in webpack.
// You can't do this without that. Only importScripts works.
import { parse } from "midiconvert";

const file = new FileReader();

const _self = self as any;

let name;

file.onload = () => {
  try {
    // heavy computation
    const parsedMidi = parse(file.result);
    const json = parsedMidi.toJSON();

    console.log(JSON.stringify(json));

    if (!json.header.name) json.header.name = name;

    _self.postMessage({
      data: json
    });
  } catch (e) {
    _self.postMessage({
      error: e.message
    });
  }
};

self.onmessage = e => {
  file.readAsArrayBuffer(e.data);
  name = e.data.name;
};
