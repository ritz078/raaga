importScripts("https://unpkg.com/midiconvert");

const file = new FileReader();

file.onload = () => {
  const parsedMidi = self.MidiConvert.parse(file.result);
  self.postMessage(parsedMidi)
};

self.onmessage = (e) => {
  file.readAsArrayBuffer(e.data);
};
