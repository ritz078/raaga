export interface Header {
  name?: string;
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
  id: number;
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
