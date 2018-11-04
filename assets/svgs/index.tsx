import * as React from "react";
import Tracks from "./tracks.svg";
import Upload from "./upload.svg";
import Midi from "./midi.svg";
import Volume from "./volume.svg";
import VolumeMute from "./volume-mute.svg";
import Play from "./play.svg";
import Pause from "./pause.svg";
import Settings from "./settings.svg";
import Record from "./record.svg";
import Stop from "./stop.svg";
import { colors } from "@anarock/pebble";

const mapping = {
  tracks: Tracks,
  upload: Upload,
  midi: Midi,
  volume: Volume,
  "volume-mute": VolumeMute,
  play: Play,
  pause: Pause,
  settings: Settings,
  record: Record,
  stop: Stop
};

interface IconProps extends React.SVGProps<React.ReactSVGElement> {
  name: string;
  size?: number;
  color?: string;
}

const Icon: React.SFC<IconProps> = ({
  name,
  size = 20,
  color = colors.white.base,
  ...props
}) => {
  const IconComp = mapping[name];
  const scale = size / 24;
  // @ts-ignore
  return (
    <IconComp
      style={{ transform: `scale(${scale})` }}
      fill={color}
      {...props}
    />
  );
};

export { Icon };
