let id = 1;

export function promiseWorker(
  worker: Worker,
  payload,
  transferables?
): Promise<any> {
  const _id = id;
  worker.postMessage({ ...payload, id: _id }, transferables);
  id++;

  return new Promise(resolve => {
    worker.onmessage = e => {
      if (e.data.id === _id) {
        resolve(e.data.payload);
      }
    };
  });
}
