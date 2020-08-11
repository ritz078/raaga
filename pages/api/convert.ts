import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import { MidiParser } from "@utils/MidiParser";

export const config = {
  api: {
    bodyParser: false
  }
};

export default (req: NextApiRequest, res: NextApiResponse) => {
  const form = formidable({ multiples: true });
  form.parse(req, (err, _, { file }) => {
    if (err) {
      res.status(500);
      return;
    }
    const data = fs.readFileSync(file.path);
    const arrayBuffer = toArrayBuffer(data);

    const midi = new MidiParser(arrayBuffer, file.name);

    res.json(midi.parse());
  });
};

function toArrayBuffer(buf: Buffer) {
  let ab = new ArrayBuffer(buf.length);
  let view = new Uint8Array(ab);
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}
