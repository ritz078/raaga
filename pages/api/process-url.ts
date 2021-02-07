import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import * as mm from "@magenta/music/node/core";

export default async function(req: NextApiRequest, res: NextApiResponse) {
  const { url: pathname, name } = req.query;

  try {
    if (typeof pathname !== "string") return;
    const _url = req.headers.referer + pathname.substr(1);
    const { data } = await axios.get(_url, {
      responseType: "arraybuffer"
    });
    const ns = await mm.midiToSequenceProto(data);

    res.json({ ...ns.toJSON(), collectionName: name });
  } catch (e) {
    res.status(400).send(e.message);
  }
}
