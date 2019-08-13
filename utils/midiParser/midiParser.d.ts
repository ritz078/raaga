export interface Tempo {
  bpm: number;
  ticks: number;
  time?: number;
}

export interface Header {
  name?: string;
  // keySignatures: {
  //   scale: "minor" | "major";
  //   key: string;
  //   ticks: number;
  // }[];
  // tempos: Tempo[];
  // meta: {
  //   ticks: number;
  //   type: "endOfTrack";
  //   text: string;
  // }[];
  // timeSignatures: {
  //   ticks: number;
  //   timeSignature: [number, number];
  //   measures?: number;
  // }[];
  ppq: number;
}

export interface Note {
  midi: number;
  name: string;
  duration: number;
  time: number;
  slides: any[];
}

export interface Instrument {
  name: string;
  number: number;
  value: string;
  family: string;
}

export interface Track {
  n: number;
  volume: number;
  name: string;
  notes: Note[];
  instrument: Instrument;
  channel: number;
  duration: number;
  program: number;
}

export interface Beat {
  n: number;
  volume: number;
  instrument: Partial<Instrument>;
  notes: {
    time: number;
  }[];
}

export interface MidiJSON {
  beats: Beat[];
  duration: number;
  tracks: Track[];
  header: Header;
}
