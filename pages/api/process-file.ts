import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import { MidiParser } from "@utils/MidiParser";
import { execSync } from "child_process";
import os from "os";
import crypto from "crypto";
import path from "path";

const tmpDir = os.tmpdir?.();

export const config = {
  api: {
    bodyParser: false
  }
};

// This terrible magic is due to an issue in Next.js.
// https://github.com/vercel/next.js/issues/8251#issuecomment-657770901
const verovioDir = path.resolve("./public/bin/verovio");

export default (req: NextApiRequest, res: NextApiResponse) => {
  const form = formidable({ multiples: true });
  form.parse(req, (err, _, { file }) => {
    if (err) {
      res.status(500);
      return;
    }

    if (file.type === "audio/midi") {
      const data = fs.readFileSync(file.path);
      const arrayBuffer = toArrayBuffer(data);

      const midi = new MidiParser(arrayBuffer, file.name);
      res.json(midi.parse());
    } else {
      const name =
        path.join(tmpDir, crypto.randomBytes(16).toString("hex")) + ".mid";

      // Ideally the path should be resolved using __dirname but due to bug in next.js,
      // __dirname doesn't give correct result.
      execSync(
        `${path.join(verovioDir, "verovio")} -r ${verovioDir} -f xml -t midi -o ${name} ${file.path}`
      );
      const data = fs.readFileSync(name);
      const arrayBuffer = toArrayBuffer(data);
      const midi = new MidiParser(arrayBuffer, file.name);
      res.json(midi.parse());

      fs.unlinkSync(name);
    }
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
