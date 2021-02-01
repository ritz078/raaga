import axios, { CancelTokenSource } from "axios";
import { Midi } from "@utils/Midi/Midi";
import { parseMp3 } from "@utils/mp3Parser";

let getFileDetailsToken: CancelTokenSource;
export async function getFileDetails(file: File): Promise<Midi> {
  if (getFileDetailsToken) {
    getFileDetailsToken.cancel();
  }

  if (file.name.endsWith(".mp3")) {
    return parseMp3(file)
  }

  getFileDetailsToken = axios.CancelToken.source();

  const formData = new FormData();
  formData.append("file", file, file.name);

  try {
    const { data } = await axios.post("/api/process-file", formData, {
      cancelToken: getFileDetailsToken.token
    });

    getFileDetailsToken = null;
    return new Midi(data);
  } catch (e) {
    throw new Error(e.response?.data);
  }
}

let getDetailsForFileToken: CancelTokenSource;
export async function getDetailsFromURL(
  url: string,
  name: string
): Promise<Midi> {
  if (getDetailsForFileToken) {
    getDetailsForFileToken.cancel();
  }

  getDetailsForFileToken = axios.CancelToken.source();
  try {
    const { data } = await axios.get("/api/process-url", {
      params: {
        url,
        name
      },
      cancelToken: getDetailsForFileToken.token
    });
    getDetailsForFileToken = null;
    return new Midi(data);
  } catch (e) {
    console.log(e)
    throw new Error(e.response?.data);
  }
}
