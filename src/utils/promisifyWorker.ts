export function promisifyWorker(worker: Worker) {
  return async (message: any, transferable?: Transferable[]) => {
    const uint = new Uint32Array(1);
    const id = window.crypto.getRandomValues(uint)[0];

    worker.postMessage({ id, message }, transferable);

    return new Promise((resolve) => {
      worker.onmessage = (ev) => {
        const _id = ev.data.id;
        if (id === _id) {
          resolve(ev.data.message);
        }
      };
    });
  };
}
