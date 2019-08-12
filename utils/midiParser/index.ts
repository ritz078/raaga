import { getInstrumentById } from "midi-instruments";
import { last } from "lodash";
import { Beat, Note, Track } from "./midiParser";
import { drumNames } from "./midiConstants";
import MidiFile from "midifile";
import MidiEvents from "midievents";
import { MidiNumbers } from "piano-utils";

export default class MidiParser {
  arrayBuffer: ArrayBuffer;
  song = {
    duration: 0,
    tracks: [],
    beats: [],
    header: {
      ppq: 480
    }
  };

  beats = [];

  constructor(arrayBuffer: ArrayBuffer) {
    this.arrayBuffer = arrayBuffer;
  }

  startDrum = event => {
    const beat = this.takeBeat(event.param1);
    beat.notes.push({
      time: event.playTime / 1000
    });
  };

  private takeBeat = n => {
    for (let i = 0; i < this.song.beats.length; i++) {
      if (this.song.beats[i].n == n) {
        return this.song.beats[i];
      }
    }

    const instrumentName = drumNames[n];

    const beat: Beat = {
      n: n,
      notes: [],
      volume: 1,
      instrument: {
        name: instrumentName,
        family: "Drums",
        number: n,
        value: instrumentName.toLowerCase().replace(/ /g, "_")
      }
    };
    this.song.beats.push(beat);
    return beat;
  };

  startNote = ({ channel, playTime, param1 }) => {
    const track: Track = this.takeTrack(channel);
    track.notes.push({
      time: playTime / 1000,
      midi: param1,
      duration: 0.0000001,
      slides: [],
      name: MidiNumbers.getAttributes(param1).note
    });
  };

  closeNote = event => {
    const track = this.takeTrack(event.channel);
    for (let i = 0; i < track.notes.length; i++) {
      const note: Note = track.notes[i];
      if (
        note.duration == 0.0000001 &&
        note.midi == event.param1 &&
        note.time < event.playTime / 1000
      ) {
        note.duration = event.playTime / 1000 - note.time;
        break;
      }
    }
  };

  addSlide = event => {
    const track = this.takeTrack(event.channel);

    track.notes.forEach(note => {
      if (
        note.duration === 0.0000001 && //
        note.time < event.playTime / 1000
      ) {
        note.slides.push({
          midi: note.pitch + (event.param2 - 64) / 6,
          time: event.playTime / 1000 - note.when
        });
      }
    });
  };

  takeTrack = n => {
    for (let i = 0; i < this.song.tracks.length; i++) {
      if (this.song.tracks[i].n == n) {
        return this.song.tracks[i];
      }
    }

    const track: Partial<Track> = {
      n,
      notes: [],
      volume: 1,
      program: 0
    };
    this.song.tracks.push(track);
    return track;
  };

  parse = () => {
    const midi = new MidiFile(this.arrayBuffer);

    this.song.header.ppq = midi.header.getTicksPerBeat();

    const events = midi.getEvents();

    events.forEach(event => {
      const { subtype, channel, param1, param2 } = event;

      if (this.song.duration < event.playTime / 1000) {
        this.song.duration = event.playTime / 1000;
      }
      if (subtype === MidiEvents.EVENT_MIDI_NOTE_ON) {
        if (channel === 9) {
          if (param1 >= 35 && param1 <= 81) {
            this.startDrum(event);
          } else {
            console.log("wrong drum", event);
          }
        } else {
          if (param1 >= 0 && param1 <= 127) {
            //console.log('start', param1);
            this.startNote(event);
          } else {
            console.log("wrong tone", event);
          }
        }
      } else {
        if (subtype === MidiEvents.EVENT_MIDI_NOTE_OFF) {
          if (channel !== 9) {
            this.closeNote(event);
          }
        } else {
          if (subtype === MidiEvents.EVENT_MIDI_PROGRAM_CHANGE) {
            if (channel !== 9) {
              const track = this.takeTrack(channel);
              track.program = param1;
              track.channel = channel;
              const { name, value, group } = getInstrumentById(param1);
              track.instrument = {
                name,
                value,
                family: group,
                number: param1
              };
            } else {
              console.log("skip program for drums");
            }
          } else {
            if (subtype == MidiEvents.EVENT_MIDI_CONTROLLER) {
              if (param1 === 7) {
                if (channel !== 9) {
                  const track = this.takeTrack(channel);
                  track.volume = param2 / 127 || 0.000001;
                }
              }
            } else {
              if (subtype == MidiEvents.EVENT_MIDI_PITCH_BEND) {
                //console.log('	bend', channel, param1, param2);
                this.addSlide(event);
              } else {
                console.log("unknown", channel, event);
              }
            }
          }
        }
      }
    });

    this.song.tracks.forEach(track => {
      const lastNote: Note = last(track.notes);
      track.duration = lastNote ? lastNote.time + lastNote.duration : 0;
    });

    // remove tracks with zero notes.
    this.song.tracks = this.song.tracks.filter(track => track.duration);

    return this.song;
  };
}
