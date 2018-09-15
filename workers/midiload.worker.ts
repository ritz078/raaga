import { parse } from "midiconvert";

const file = new FileReader();

file.onload = () => {
  const parsedMidi = parse(file.result);

  parsedMidi.tracks = parsedMidi.tracks.map(track => ({
		...track,
		duration: track.duration
	}));
  // @ts-ignore
  self.postMessage(parsedMidi);
};

self.onmessage = e => {
  file.readAsArrayBuffer(e.data);
};
