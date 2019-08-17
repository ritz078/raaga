import { MidiJSON } from "@utils/midiParser/midiParser";

export interface PlayerControllerProps {
  midi: MidiJSON;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStartPlay: () => void;
  style?: any;
}
