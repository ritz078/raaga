importScripts("https://unpkg.com/midiconvert");

const file = new FileReader();

file.onload = () => {
  const parsedMidi = self.MidiConvert.parse(file.result);
  console.log(parsedMidi);
  self.postMessage(parsedMidi.tracks[1].notes.map(x => ({
    ...x,
    note: x.midi,
    duration: 4
  })).slice(0, 500))
};

self.onmessage = (e) => {
  file.readAsArrayBuffer(e.data);
};
