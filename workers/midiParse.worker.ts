import MidiParser from "@utils/midiParser";

const _self = self as any;

_self.onmessage = async ({ data: { id, filePath, name } }) => {
  const url =
    typeof filePath === "string"
      ? _self.location.origin + filePath
      : URL.createObjectURL(filePath);

  const res = await fetch(url);

  const arrayBuffer = await res.arrayBuffer();
  const midi = new MidiParser(arrayBuffer, name);
  const payload = midi.parse();

  _self.postMessage({
    payload,
    id
  });
};
