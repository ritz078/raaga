import { createContext } from "react";

export interface Theme {
  naturalColor: string;
  accidentalColor: string;
}

export const ThemeContext = createContext<Theme>(null);
