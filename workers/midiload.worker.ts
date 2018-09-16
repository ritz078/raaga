import { parse } from "midiconvert";

const file = new FileReader();

const _self = self as any;

file.onload = () => {
  try {
    const parsedMidi = parse(file.result);

    console.log(parsedMidi);

    parsedMidi.tracks = parsedMidi.tracks.map(track => ({
      ...track,
      duration: track.duration
    }));
    _self.postMessage({
      data: parsedMidi
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
