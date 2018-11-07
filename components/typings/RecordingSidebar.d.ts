import { MIDI } from "midiconvert";
import { AnyAction, Dispatch } from "redux";

export interface RecordingsSidebarProps {
  visible: boolean;
  onClose: () => void;
  recordings: (MIDI & {
    id: string;
  })[];
  dispatch: Dispatch<AnyAction>;
  onTrackSelect: (midi: MIDI, i) => void;
}
