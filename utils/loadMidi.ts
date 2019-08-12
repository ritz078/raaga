import { Midi } from "@tonejs/midi";
import MidiParser from "@utils/midiParser";

export function loadMidi(data: ArrayBuffer) {
  return new Midi(data);
}

export async function loadMidiAsync(url: string) {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();

  const midi = new MidiParser(arrayBuffer);
  return midi.parse();
}
