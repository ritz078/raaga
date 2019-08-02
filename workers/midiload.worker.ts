import { loadMidi } from "@utils/loadMidi";

const _self: Worker = self as any;

self.onmessage = async ({ data }) => {
  try {
    const json = await loadMidi(data, data.name);

    _self.postMessage({
      data: json
    });
  } catch (e) {
    _self.postMessage({
      error: e.message
    });
  }
};
