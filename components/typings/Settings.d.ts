import { RecorderProps } from "./Recorder";

export interface SettingsProps extends RecorderProps {
  instrument: string;
  onInstrumentChange: (id: string) => void;
}
