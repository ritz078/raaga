import { get as getInIDB, set as setInIDB } from "idb-keyval";
import {
  getInstrumentById,
  getInstrumentIdByValue,
  instruments
} from "midi-instruments";

const DRUMS_NAME = "drumsBeats";

let midiFontData = {
  tracks: {},
  drums: null
};

function getIdbKey(instrumentId) {
  return `instrument:${instrumentId}`;
}

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

  if (isDrums) {
    const _drums = await getInIDB(DRUMS_NAME);
    if (drums) {
      return _drums;
    }
  } else {
    const track = await getInIDB(getIdbKey(instrumentId));
    if (track) return track;
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
  const result = midiJsToJson(data);

  if (isDrums) {
    await setInIDB(DRUMS_NAME, result);
  } else {
    await setInIDB(getIdbKey(instrumentId), result);
  }

  return result;
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

async function loadInstruments(instrumentIds: number[], drums?: boolean) {
  const promises = instrumentIds.map(instrumentId => {
    const { value } = getInstrumentById(instrumentId.toString(10));

    return loadSoundFont(value);
  });

  const drumPromise = drums ? loadSoundFont(null, true) : undefined;

  await Promise.all([...promises, ...(drumPromise ? [drumPromise] : [])]);
  return midiFontData;
}

self.onmessage = async ev => {
  const {
    id,
    message: { instrumentIds, drums }
  } = ev.data;

  self.postMessage({
    id,
    message: await loadInstruments(instrumentIds, drums)
  });
};

