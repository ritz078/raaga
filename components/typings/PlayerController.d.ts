import { MidiJSON } from "@typings/midi";

export interface PlayerControllerProps {
  midi: MidiJSON;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStartPlay: () => void;
  style?: any;
}
