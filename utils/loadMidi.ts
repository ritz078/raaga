import { Midi } from "@tonejs/midi";

export function loadMidi(data: ArrayBuffer) {
  return new Midi(data);
}

export async function loadMidiAsync(url: string) {
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  return loadMidi(arrayBuffer);
}
