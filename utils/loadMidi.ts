import { Midi } from "@tonejs/midi";
import { HeaderJSON } from "@tonejs/midi/dist/Header";
import { TrackJSON } from "@tonejs/midi/dist/Track";

interface Track extends TrackJSON {
  duration: number;
}

interface MidiJSON {
  header: HeaderJSON;
  tracks: Track[];
  duration: number;
}

export async function loadMidi(
  data: object | string,
  name?: string
): Promise<MidiJSON> {
  const url = typeof data === "object" ? URL.createObjectURL(data) : data;

  const parsedMidi = await Midi.fromUrl(url);
  const json = parsedMidi.toJSON();

  // add duration at root and track level
  const jsonWithDuration = {
    ...json,
    duration: parsedMidi.duration,
    tracks: json.tracks.map((track, i) => ({
      ...track,
      duration: parsedMidi.tracks[i].duration
    }))
  };

  jsonWithDuration.header.name = jsonWithDuration.header.name || name;
  return jsonWithDuration;
}
