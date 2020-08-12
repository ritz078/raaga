import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { MidiParser } from "@utils/MidiParser";

export default async function(req: NextApiRequest, res: NextApiResponse) {
  const { url: pathname, name } = req.query;

  if (typeof pathname !== 'string') return;
  const _url = req.headers.referer + pathname.substr(1);
  const { data } = await axios.get(_url, {
    responseType: "arraybuffer"
  });

  const midi = new MidiParser(data, name as string);
  res.json(midi.parse());
}
