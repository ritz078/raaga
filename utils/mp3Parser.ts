import { Midi } from "@utils/Midi/Midi";
import { OnsetsAndFrames } from "@magenta/music/es6/transcription";

const model = new OnsetsAndFrames(
  "https://storage.googleapis.com/magentadata/js/checkpoints/transcription/onsets_frames_uni"
);

export async function parseMp3(file: File): Promise<Midi> {
  await model.initialize();
  const ns = await model.transcribeFromAudioFile(file);

  return new Midi(ns);
}
