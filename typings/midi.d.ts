export interface IHeader {
  name?: string;
  ppq: number;
  tempo: {
    bpm: number;
    time: number;
  }[];
}

export interface INote {
  midi: number;
  name: string;
  duration: number;
  time: number;
  slides: any[];
}

export interface IInstrument {
  name: string;
  number: number;
  value: string;
  family: string;
}

export interface ITrack {
  n: number;
  volume: number;
  name: string;
  notes: INote[];
  instrument: IInstrument;
  channel: number;
  duration: number;
  program: number;
  id: number;
}

export interface IBeat {
  n: number;
  volume: number;
  instrument: Partial<IInstrument>;
  notes: {
    time: number;
  }[];
}

export interface IMidiJSON {
  beats: IBeat[];
  duration: number;
  tracks: ITrack[];
  header: IHeader;
}
