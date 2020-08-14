import axios, { CancelTokenSource } from "axios";
import { IMidiJSON } from "@typings/midi";
import { error } from "next/dist/build/output/log";

let getFileDetailsToken: CancelTokenSource;
export async function getFileDetails(file: File): Promise<IMidiJSON> {
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
): Promise<IMidiJSON> {
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
