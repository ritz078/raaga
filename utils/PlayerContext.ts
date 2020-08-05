import { getDefaultRange } from "@config/piano";
import { MidiPlayer } from "@utils/MidiPlayer";
import React from "react";

export const player = new MidiPlayer(getDefaultRange());

export const PlayerContext = React.createContext(player);
