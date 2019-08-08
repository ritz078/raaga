import { parseArrayBuffer } from "midi-json-parser";
import {
  IMidiFile,
  IMidiTrackNameEvent,
  TMidiEvent
} from "midi-json-parser-worker";
import { getInstrumentById } from "midi-instruments";
import Tone from "tone";
import { last, groupBy, flatten, values } from "lodash";
import { Header, MidiJSON, Note, Track } from "./midiParser";
import { drumNames, keySignatureKeys } from "./midiConstants";

enum NOTE_EVENT_TYPE {
  NOTE_ON = 1,
  NOTE_OFF
}

type Event = TMidiEvent & {
  absoluteTime: number;
};

export function search(array: any[], value: any, prop = "ticks"): number {
  let beginning = 0;
  const len = array.length;
  let end = len;
  if (len > 0 && array[len - 1][prop] <= value) {
    return len - 1;
  }
  while (beginning < end) {
    // calculate the midpoint for roughly equal partition
    let midPoint = Math.floor(beginning + (end - beginning) / 2);
    const event = array[midPoint];
    const nextEvent = array[midPoint + 1];
    if (event[prop] === value) {
      // choose the last one that has the same value
      for (let i = midPoint; i < array.length; i++) {
        const testEvent = array[i];
        if (testEvent[prop] === value) {
          midPoint = i;
        }
      }
      return midPoint;
    } else if (event[prop] < value && nextEvent[prop] > value) {
      return midPoint;
    } else if (event[prop] > value) {
      // search lower
      end = midPoint;
    } else if (event[prop] < value) {
      // search upper
      beginning = midPoint + 1;
    }
  }
  return -1;
}

export default class MidiParser {
  arrayBuffer: ArrayBuffer;
  header: Header = {
    keySignatures: [],
    name: "",
    tempos: [],
    meta: [],
    timeSignatures: [],
    ppq: 480
  };

  beats = [];

  constructor(arrayBuffer: ArrayBuffer) {
    this.arrayBuffer = arrayBuffer;
  }

  private update = () => {
    let currentTime = 0;
    let lastEventBeats = 0;
    // make sure it's sorted
    this.header.tempos.sort((a, b) => a.ticks - b.ticks);
    this.header.tempos.forEach((event, index) => {
      const lastBPM =
        index > 0
          ? this.header.tempos[index - 1].bpm
          : this.header.tempos[0].bpm;
      const beats = event.ticks / this.header.ppq - lastEventBeats;
      const elapsedSeconds = (60 / lastBPM) * beats;
      // @ts-ignore
      event.time = elapsedSeconds + currentTime;
      currentTime = event.time;
      lastEventBeats += beats;
    });
    this.header.timeSignatures.sort((a, b) => a.ticks - b.ticks);
    this.header.timeSignatures.forEach((event, index) => {
      const lastEvent =
        index > 0
          ? this.header.timeSignatures[index - 1]
          : this.header.timeSignatures[0];
      const elapsedBeats = (event.ticks - lastEvent.ticks) / this.header.ppq;
      const elapsedMeasures =
        elapsedBeats /
        lastEvent.timeSignature[0] /
        (lastEvent.timeSignature[1] / 4);
      lastEvent.measures = lastEvent.measures || 0;
      event.measures = elapsedMeasures + lastEvent.measures;
    });
  };

  private ticksToSeconds(ticks: number): number {
    // find the relevant position
    const index = search(this.header.tempos, ticks);
    if (index !== -1) {
      const tempo = this.header.tempos[index];
      const tempoTime = tempo.time;
      const elapsedBeats = (ticks - tempo.ticks) / this.header.ppq;
      return tempoTime + (60 / tempo.bpm) * elapsedBeats;
    } else {
      // assume 120
      const beats = ticks / this.header.ppq;
      return (60 / 120) * beats;
    }
  }

  private setHeader(events: Event[]) {
    let ticks = 0;
    events.forEach(event => {
      if (event.keySignature) {
        const { key, scale } = event.keySignature as any;

        ticks += event.delta;

        this.header.keySignatures.push({
          key: keySignatureKeys[key + 7],
          scale: scale === 0 ? "major" : "minor",
          ticks
        });
      } else if (event.trackName) {
        this.header.name = event.trackName as string;
      } else if (event.setTempo) {
        this.header.tempos.push({
          // @ts-ignore
          bpm: 60000000 / event.setTempo.microsecondsPerBeat,
          ticks: event.absoluteTime
        });
      } else if (event.endOfTrack) {
        this.header.meta.push({
          text: event.text as string,
          ticks: event.absoluteTime,
          type: "endOfTrack"
        });
      } else if (event.timeSignature) {
        const { numerator, denominator } = event.timeSignature as any;

        this.header.timeSignatures.push({
          ticks: event.absoluteTime,
          timeSignature: [numerator, denominator]
        });
      }
    });

    this.update();
  }

  private getNotes = (track: Event[]): Note[] => {
    const lastNoteOnMapping = {};

    const notes = [];

    track
      .filter(event => event.noteOn || event.noteOff)
      .forEach((event, i) => {
        const { noteNumber, velocity } = (event.noteOn || event.noteOff) as any;

        if (event.noteOn) {
          lastNoteOnMapping[noteNumber] = i;
        } else {
          // if this is noteOff event then populate duration and noteOffVelocity in the corresponding
          // noteStart event.
          const index = lastNoteOnMapping[noteNumber];
          const note = notes[index];
          note.durationTick = event.absoluteTime - note.absoluteTime;
          note.noteOffVelocity = note.velocity;
          note.duration = this.ticksToSeconds(note.durationTick);
        }

        notes.push({
          type: event.noteOn
            ? NOTE_EVENT_TYPE.NOTE_ON
            : NOTE_EVENT_TYPE.NOTE_OFF,
          name: Tone.Frequency(noteNumber, "midi").toNote(),
          midi: noteNumber,
          absoluteTime: event.absoluteTime,
          velocity: velocity / 100,
          time: this.ticksToSeconds(event.absoluteTime)
        });
      });

    return notes.filter(note => note.type === NOTE_EVENT_TYPE.NOTE_ON);
  };

  private normalizeTracks = (tracks: TMidiEvent[][]) => {
    const _tracks = [];

    tracks.forEach((events, i) => {
      const channels = events
        .filter(event => event.channel !== "undefined")
        .map(event => event.channel);

      if (channels.length > 1) {
        const grouped = groupBy(events, "channel");
        _tracks[i] = values(grouped);
      } else {
        _tracks[i] = events;
      }
    });

    return flatten(_tracks);
  };

  private setBeatEvents = (events: TMidiEvent[]) => {
    const groupedByNoteNumber = groupBy(
      events.filter(
        (event: any) =>
          event.noteOn &&
          event.noteOn.noteNumber >= 35 &&
          event.noteOn.noteNumber <= 81
      ),
      event => (<any>event.noteOn).noteNumber
    );

    this.beats = Object.keys(groupedByNoteNumber).map(number => ({
      instrument: {
        name: drumNames[number],
        family: "Drums",
        number: +number,
        value: drumNames[number]
          ? drumNames[number].toLowerCase().replace(/ /g, "_")
          : ""
      },
      notes: groupedByNoteNumber[number].map(note => ({
        time: this.ticksToSeconds(<any>note.absoluteTime)
      }))
    }));
  };

  async parse(): Promise<MidiJSON> {
    const parsedArrayBuffer: IMidiFile = await parseArrayBuffer(
      this.arrayBuffer
    );

    const normalizedTracks = this.normalizeTracks(parsedArrayBuffer.tracks);

    this.header.ppq = parsedArrayBuffer.division;

    const tracks = normalizedTracks
      .map(events => {
        let currentTick = 0;
        events.forEach(event => {
          currentTick += event.delta;
          event.absoluteTime = currentTick;
        });

        const _track = {
          name: undefined,
          notes: [],
          instrument: {
            name: "",
            number: 0,
            value: "",
            family: ""
          },
          channel: 0,
          duration: 0
        };

        const eventWithTrackName = events.find(
          (event: TMidiEvent) => "trackName" in event
        );

        if (eventWithTrackName as IMidiTrackNameEvent) {
          _track.name = eventWithTrackName.trackName;
        }

        const eventWithProgramChange = events.find(
          (event: TMidiEvent) => "programChange" in event
        );

        if (eventWithProgramChange) {
          const patchId = (<any>eventWithProgramChange.programChange)
            .programNumber;

          const channel = eventWithProgramChange.channel as number;
          _track.channel = channel;

          if (channel === 9) {
            return undefined;
          } else {
            const { name, value, group } = getInstrumentById(patchId);

            _track.instrument = {
              ..._track.instrument,
              number: patchId,
              name,
              value,
              family: group
            };
          }
        }

        this.setHeader(events as Event[]);
        _track.notes = this.getNotes(events as Event[]);
        const lastNote: Note = last(_track.notes);
        _track.duration = lastNote ? lastNote.duration + lastNote.time : 0;

        return _track;
      })
      .filter(Boolean);

    if (parsedArrayBuffer.format === 1 && !tracks[0].duration) {
      tracks.shift();
    }

    const beatEvents = flatten(normalizedTracks).filter(
      event => event.channel === 9
    );

    this.setBeatEvents(beatEvents);

    return {
      tracks,
      beats: this.beats,
      header: this.header,
      duration: Math.max(...tracks.map(track => track.duration))
    };
  }
}
