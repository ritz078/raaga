import { INoteSequence, NoteSequence } from "@magenta/music/es6/protobuf";
import { groupBy } from "lodash";
import { getInstrumentById } from "midi-instruments";
import { drumNames } from "@utils/MidiParser/midiConstants";
import { tensorflow } from "@magenta/music/es6/protobuf/proto";
import * as mm from "@magenta/music/es6/core"
export type INote = tensorflow.magenta.NoteSequence.INote;

export interface IInstrument {
  family?: string;
  number: number;
  name: string;
  value: string;
}

export interface ITrackSequence {
  instrument: IInstrument;
  notes: INote[];
  totalTime: number;
}

export class Midi extends NoteSequence {
  public beats: ITrackSequence[];
  public tracks: ITrackSequence[];

  static getGroupedTrackInfo(ns: INoteSequence) {
    const { true: drums, false: instruments } = groupBy(ns.notes, "isDrum");
    const _beats = groupBy(drums, "pitch");
    const _tracks = groupBy(instruments, "instrument");

    const tracks = Object.keys(_tracks).map(instrumentId => {
      const instrument = getInstrumentById(instrumentId);
      return {
        instrument: {
          ...instrument,
          number: +instrumentId
        },
        notes: _tracks[instrumentId],
        totalTime: ns.totalTime
      };
    });

    const beats = Object.keys(_beats).map(drum => {
      const instrumentName = drumNames[drum];

      return {
        instrument: {
          name: instrumentName || "Unknown",
          family: "Drums",
          number: +drum,
          value: instrumentName?.toLowerCase().replace(/ /g, "_")
        },
        notes: _beats[drum],
        totalTime: ns.totalTime
      };
    });

    return {
      beats,
      tracks
    };
  }

  constructor(ns: INoteSequence) {
    super(ns);
    const { beats, tracks } = Midi.getGroupedTrackInfo(ns);
    this.beats = beats;
    this.tracks = tracks;
  }

  staffVisualiser (trackIndex: number, element: HTMLDivElement) {
    return new mm.StaffSVGVisualizer({
      ...this.toJSON() as INoteSequence,
      notes: this.tracks[trackIndex].notes
    }, element)
  }
}
