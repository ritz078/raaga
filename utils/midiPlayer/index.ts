import Tone from "tone";
import { MidiJSON, Note } from "@utils/midiParser/midiParser";
import LoadInstrumentWorker from "@workers/loadInstrument.worker";
import { promiseWorker } from "@utils/promiseWorker";
import { flatten } from "lodash";

const loadInstrumentWorker = new LoadInstrumentWorker();

export class BackgroundPlayer {
  song: MidiJSON;
  trackSamplers = new Array(128).fill(null).map(() => {
    const sampler = new Tone.Sampler({});
    sampler.connect(Tone.Master);
    return sampler;
  });
  drumSampler = new Tone.Sampler({});
  trackPart = [];
  drumPart = [];

  constructor(song: MidiJSON) {
    this.song = song;

    this.drumSampler.connect(Tone.Master);
  }

  public setSong(song: MidiJSON) {
    this.song = song;
  }

  load1 = async () => {
    // @ts-ignore
    const data: {
      tracks: {
        [k: string]: string;
      }[];
      drums: {
        [k: string]: string;
      };
    } = await promiseWorker(loadInstrumentWorker, {
      song: this.song
    });

    let drumPromise;
    if (data.drums) {
      drumPromise = Object.keys(data.drums).map(
        key =>
          new Promise(resolve =>
            this.drumSampler.add(key, data.drums[key], resolve)
          )
      );
    }
    const promises = flatten(
      Object.keys(data.tracks).map(key =>
        Object.keys(data.tracks[key]).map(
          tone =>
            new Promise(resolve => {
              return this.trackSamplers[key].add(
                tone,
                data.tracks[key][tone],
                resolve
              );
            })
        )
      )
    );

    await Promise.all([...promises, ...(drumPromise ? [drumPromise] : [])]);
    this.schedule();
  };

  schedule = () => {
    this.song.tracks.forEach(track => {
      const index = track.instrument.number;

      this.trackSamplers[index].volume.value = track.volume;
      this.trackPart[index] = new Tone.Part((time, note: Note) => {
        this.trackSamplers[index].triggerAttackRelease(
          note.name,
          note.duration,
          time
        );
      }, track.notes).start();
    });

    this.song.beats.forEach(beat => {
      this.drumPart[beat.instrument.number] = new Tone.Part(
        time => {
          const midi = beat.instrument.number;
          this.drumSampler.triggerAttack(
            Tone.Frequency(midi, "midi").toNote(),
            time
          );
        },
        beat.notes.map(_beat => ({
          ..._beat,
          note: Tone.Frequency(beat.instrument.number, "midi").toNote()
        }))
      ).start();
    });

    Tone.Transport.start();
  };

  public clear = () => {
    [...this.trackPart, ...this.drumPart].forEach(trackPart => {
      if (!trackPart) return;
      if (trackPart._state) {
        trackPart.dispose();
      }
      trackPart = null;
    });

    Tone.Transport.stop();
  };
}
