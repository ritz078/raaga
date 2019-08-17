import MidiParser from "@utils/midiParser";

export async function loadMidiAsync(url: string) {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();

  const midi = new MidiParser(arrayBuffer);
  return midi.parse();
}
