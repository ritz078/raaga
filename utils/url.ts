import axios, { CancelTokenSource } from "axios";
import { IMidiJSON } from "@typings/midi";

interface IDetailsResponse {
  midi: IMidiJSON;
  musixXml?: string;
}

let getFileDetailsToken: CancelTokenSource;
export async function getFileDetails(file: File): Promise<IDetailsResponse> {
  if (getFileDetailsToken) {
    getFileDetailsToken.cancel();
  }

  getFileDetailsToken = axios.CancelToken.source();

  const formData = new FormData();
  formData.append("file", file, file.name);

  try {
    const { data } = await axios.post("/api/process-file", formData, {
      cancelToken: getFileDetailsToken.token
    });

    getFileDetailsToken = null;
    return data;
  } catch (e) {
    throw new Error(e.response?.data);
  }
}

let getDetailsForFileToken: CancelTokenSource;
export async function getDetailsFromURL(
  url: string,
  name: string
): Promise<IDetailsResponse> {
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
    return data;
  } catch (e) {
    throw new Error(e.response?.data);
  }
}
