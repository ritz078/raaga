import { set as setInIDB } from "idb-keyval";
import { getInstrumentIdByValue, instruments } from "midi-instruments";
import { MidiJSON } from "@utils/midiParser/midiParser";

const _self = self as any;

const DRUMS_NAME = "drumsBeats";

const midiFontData = {
  tracks: {},
  drums: null
};

function midiJsToJson(data) {
  let begin = data.indexOf("MIDI.Soundfont.");
  if (begin < 0) throw Error("Invalid MIDI.js Soundfont format");
  begin = data.indexOf("=", begin) + 2;
  const end = data.lastIndexOf(",");
  return JSON.parse(data.slice(begin, end) + "}");
}

const fetchInstrumentFromRemote = async (
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

const loadSoundFont = async (
  instrument = instruments[0].value,
  isDrums = false
) => {
  const instrumentId = getInstrumentIdByValue(instrument);

  if (isDrums) {
    midiFontData.drums = await fetchInstrumentFromRemote(undefined, true);
  } else {
    midiFontData.tracks[instrumentId] = await fetchInstrumentFromRemote(
      instrument
    );
  }
};

const load = async (song: MidiJSON) => {
  const promises = song.tracks
    .filter(track => track.instrument && track.instrument.value)
    // @ts-ignore
    .map(track => loadSoundFont(track.instrument.value));

  let drumPromise;
  if (song.beats && song.beats.length) {
    drumPromise = loadSoundFont(null, true);
  }

  await Promise.all([...promises, ...(drumPromise ? [drumPromise] : [])]);
};

_self.onmessage = async ({ data: { id, song } }) => {
  await load(song);

  _self.postMessage({
    id,
    payload: midiFontData
  });
};
