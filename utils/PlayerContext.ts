import { DEFAULT_FIRST_KEY, DEFAULT_LAST_KEY } from "@config/piano";
import { MidiPlayer } from "@utils/MidiPlayer";
import React from "react";

const range = {
  first: DEFAULT_FIRST_KEY,
  last: DEFAULT_LAST_KEY
};

export const player = new MidiPlayer(range);

export const PlayerContext = React.createContext(player);
