import { get as getInIDB, set as setInIDB } from "idb-keyval";
import { getInstrumentIdByValue, instruments } from "midi-instruments";
import { MidiJSON } from "@utils/midiParser/midiParser";

const _self = self as any;

const DRUMS_NAME = "drumsBeats";
const MIDI_FONT_DATA_CONSTANT = "MIDI_FONT_DATA";

let midiFontData = {
  tracks: {},
  drums: null
};

(async function populateMidiFontDataFromIDB() {
  try {
    const data = await getInIDB(MIDI_FONT_DATA_CONSTANT);

    if (data) {
      midiFontData = data as any;
    }
  } catch (e) {
    console.log(`Error in fetching ${MIDI_FONT_DATA_CONSTANT} from IDB.`);
  }
})();

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
  const instrumentId = getInstrumentIdByValue(instrument);
  const { drums, tracks } = midiFontData;

  if (isDrums && drums) {
    return drums;
  } else if (tracks[instrumentId]) {
    return tracks[instrumentId];
  }

  let url = !process.env.DEV
    ? `https://midifonts.s3.ap-south-1.amazonaws.com/${instrument}-mp3.js`
    : `https://gleitz.github.io/midi-js-soundfonts/MusyngKite/${instrument}-mp3.js`;

  if (isDrums) {
    url =
      "https://raw.githubusercontent.com/dave4mpls/midi-js-soundfonts-with-drums/gh-pages/drums-mp3.js";
  }
  const response = await fetch(url);
  const data = await response.text();
  return midiJsToJson(data);
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
    .map(track => loadSoundFont(track.instrument.value));

  let drumPromise;
  if (song.beats && song.beats.length) {
    drumPromise = loadSoundFont(null, true);
  }

  await Promise.all([...promises, ...(drumPromise ? [drumPromise] : [])]);
};

_self.onmessage = async ({ data: { id, song } }) => {
  await load(song);

  try {
    await setInIDB(MIDI_FONT_DATA_CONSTANT, midiFontData);
  } catch (e) {
    console.log(`Error in setting ${MIDI_FONT_DATA_CONSTANT}`);
  }

  _self.postMessage({
    id,
    payload: midiFontData
  });
};
