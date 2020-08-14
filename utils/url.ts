import axios from "axios";
import { IMidiJSON } from "@typings/midi";

export async function getFileDetails(file: File): Promise<IMidiJSON> {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const { data } = await axios.post("/api/process-file", formData);
  return data;
}

export async function getDetailsFromURL(
  url: string,
  name: string
): Promise<IMidiJSON> {
  return axios
    .get("/api/process-url", {
      params: {
        url,
        name
      }
    })
    .then(res => res.data)
}
