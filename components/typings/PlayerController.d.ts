import { IMidiJSON } from "@typings/midi";

export interface PlayerControllerProps {
  midi: IMidiJSON;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStartPlay: () => void;
  style?: any;
}
