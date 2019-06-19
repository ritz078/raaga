import { AnyAction, Dispatch } from "redux";
import { Midi } from "@typings/midi";

export interface RecordingsSidebarProps {
  visible: boolean;
  onClose: () => void;
  midis: (Midi & {
    id: string;
  })[];
  dispatch: Dispatch<AnyAction>;
  onTrackSelect: (midi: Midi, i) => void;
}
