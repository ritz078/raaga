import { HeaderJSON } from "@tonejs/midi/src/Header";
import { TrackJSON } from "@tonejs/midi/src/Track";
import { NoteJSON } from "@tonejs/midi/dist/Note";

export interface Track extends TrackJSON {
  duration: number;
}

export interface Midi {
  duration: number;
  header: HeaderJSON;
  tracks: Track[];
}

export type Note = NoteJSON;
