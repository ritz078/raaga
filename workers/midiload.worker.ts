// @ts-ignore
const _self: Worker = self as any;

self.onmessage = async ({ data }) => {
  try {
    const url = URL.createObjectURL(data);
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();

    _self.postMessage(arrayBuffer, [arrayBuffer]);
  } catch (e) {
    _self.postMessage({
      error: e.message
    });
  }
};
