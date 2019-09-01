import { reject } from "q";

let id = 1;

export function promisifyWorker(
  worker: Worker,
  payload,
  transferables?
): Promise<any> {
  const _id = id;
  worker.postMessage({ ...payload, id: _id }, transferables);
  id++;

  return new Promise((resolve, reject) => {
    worker.onmessage = ({ data: { id, error, payload } }) => {
      if (id === _id) {
        if (error) {
          reject(error);
        } else {
          resolve(payload);
        }
      }
    };
  });
}
