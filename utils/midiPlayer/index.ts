import Tone from "tone";
import { MidiJSON, Note } from "@utils/midiParser/midiParser";
import LoadInstrumentWorker from "@workers/loadInstrument.worker";
import { promiseWorker } from "@utils/promiseWorker";

const loadInstrumentWorker = new LoadInstrumentWorker();

export class BackgroundPlayer {
  song: MidiJSON;
  trackSamplers = [];
  drumSampler;
  trackPart = [];
  drumPart = [];

  static getTrackSampler = audio => {
    return new Promise(resolve => {
      const sampler = new Tone.Sampler(audio, () => {
        sampler.connect(Tone.Master);
        resolve(sampler);
      });
    });
  };

  constructor(song: MidiJSON) {
    this.song = song;
  }

  public setSong(song: MidiJSON) {
    this.song = song;
  }

  loadInstruments = async () => {
    const data = await promiseWorker(loadInstrumentWorker, {
      song: this.song
    });

    if (data.drums) {
      this.drumSampler = await new Promise(resolve => {
        const sampler = new Tone.Sampler(data.drums, () => {
          sampler.connect(Tone.Master);
          resolve(sampler);
        });
      });
    }

    const trackInstrumentIds = Object.keys(data.tracks);
    const samplers = await Promise.all(
      trackInstrumentIds.map(key =>
        BackgroundPlayer.getTrackSampler(data.tracks[key])
      )
    );

    samplers.forEach((sampler, i) => {
      const instrumentId = trackInstrumentIds[i];

      this.trackSamplers[instrumentId] = sampler;
    });

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
      const beatInstrumentNumber = beat.instrument.number;
      this.drumPart[beatInstrumentNumber] = new Tone.Part(
        time => {
          this.drumSampler.triggerAttack(
            Tone.Frequency(beatInstrumentNumber, "midi").toNote(),
            time
          );
        },
        beat.notes.map(_beat => ({
          ..._beat,
          note: Tone.Frequency(beatInstrumentNumber, "midi").toNote()
        }))
      ).start();
    });

    this.play();
  };

  play = () => {
    Tone.Transport.start();
  };

  public togglePlay = Tone.Transport.toggle;

  public clear = () => {
    Tone.Transport.stop();

    [...this.trackPart, ...this.drumPart].forEach(trackPart => {
      if (!trackPart) return;
      if (trackPart._state) {
        trackPart.dispose();
      }
    });

    this.trackPart = [];
    this.drumPart = [];
  };
}
