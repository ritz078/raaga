import Tone from "tone";
import { MidiJSON, Note } from "@utils/midiParser/midiParser";
import { midiJsToJson } from "@utils/Player";
import { get as getFromIDB, set as setInIDB } from "idb-keyval";
import { getInstrumentIdByValue, instruments } from "midi-instruments";

const DRUMS_NAME = "drumsBeats";

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

  private fetchInstrumentFromRemote = async (
    instrument = DRUMS_NAME,
    isDrums?: boolean
  ) => {
    let url = !process.env.DEV
      ? `https://midifonts.s3.ap-south-1.amazonaws.com/${instrument}-mp3.js`
      : `https://gleitz.github.io/midi-js-soundfonts/MusyngKite/${instrument}-mp3.js`;

    if (isDrums) {
      url =
        "https://raw.githubusercontent.com/dave4mpls/midi-js-soundfonts-with-drums/gh-pages/drums-mp3.js";
    }
    const response = await fetch(url);
    const data = await response.text();
    const audio = midiJsToJson(data);
    await setInIDB(isDrums ? DRUMS_NAME : instrument, audio);
    return audio;
  };

  /**
   * Load a soundFont and add it to Tone sampler.
   * @param instrument
   * @param isDrums
   */
  public loadSoundFont = async (
    instrument = instruments[0].value,
    isDrums = false
  ) => {
    let audio;
    try {
      audio = await getFromIDB(isDrums ? DRUMS_NAME : instrument);
      if (!audio)
        audio = await this.fetchInstrumentFromRemote(instrument, isDrums);
    } catch (e) {
      audio = await this.fetchInstrumentFromRemote(instrument, isDrums);
    }

    if (isDrums) {
      const promises = Object.keys(audio).map(
        key =>
          new Promise(resolve => this.drumSampler.add(key, audio[key], resolve))
      );

      return Promise.all(promises);
    }
    const instrumentIndex = getInstrumentIdByValue(instrument);

    const promises = Object.keys(audio).map(
      key =>
        new Promise(resolve => {
          return this.trackSamplers[instrumentIndex].add(
            key,
            audio[key],
            resolve
          );
        })
    );
    return Promise.all(promises);
  };

  load = async () => {
    const promises = this.song.tracks
      .filter(track => track.instrument.value)
      .map(track => this.loadSoundFont(track.instrument.value));

    let drumPromise;
    if (this.song.beats && this.song.beats.length) {
      drumPromise = this.loadSoundFont(null, true);
    }

    await Promise.all([...promises, ...(drumPromise ? [drumPromise] : [])]);
    this.schedule();
  };

  schedule = () => {
    this.song.tracks.forEach(track => {
      this.trackPart[track.instrument.number] = new Tone.Part(
        (time, note: Note) => {
          // TODO: end events
          this.trackSamplers[track.instrument.number].triggerAttackRelease(
            note.name,
            note.duration,
            time,
            note.velocity
          );
        },
        track.notes
      ).start();
    });

    // TODO: explore volume
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
}
