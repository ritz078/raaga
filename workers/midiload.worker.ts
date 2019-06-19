import MIDI from "@tonejs/midi";
import { Midi } from "@typings/midi";

const _self = self as any;

self.onmessage = async e => {
  try {
    const parsedMidi = await MIDI.fromUrl(URL.createObjectURL(e.data));

    const _json = parsedMidi.toJSON();

    const json: Midi = {
      ..._json,
      duration: _json.duration,
      tracks: _json.tracks.map((track, i) => ({
        ...track,
        duration: parsedMidi.tracks[i].duration
      }))
    };

    if (!json.header.name) json.header.name = e.data.data.name;

    _self.postMessage({
      data: json
    });
  } catch (e) {
    _self.postMessage({
      error: e.message
    });
  }
};
