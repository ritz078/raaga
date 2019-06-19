import { Midi } from "@typings/midi";

export interface PlayerControllerProps {
  midi: Midi;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onTrackSelect: (midi: Midi, i: number) => void;
  onStartPlay: () => void;
  style?: any;
  onReplay?: () => void;
  onToggleSidebar: () => void;
}
