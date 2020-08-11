import axios from "axios";
import { IMidiJSON } from "@typings/midi";

export async function getFileDetails(file: File): Promise<IMidiJSON> {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const { data } = await axios.post("/api/convert", formData);
  return data;
}
