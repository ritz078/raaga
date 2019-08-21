import React, {
  FunctionComponent,
  memo,
  useContext,
  useEffect,
  useState
} from "react";
import { timeCn } from "./styles/PlayerController.styles";
import Tone from "tone";
import { formatTime } from "@utils/formatTime";
import Slider from "react-input-slider";
import { PlayerContext } from "@components/SoundPlayer";

interface ProgressBarProps {
  duration: number;
}

const progressBarStyles = {
  track: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    margin: "0 15px",
    width: 150
  },
  thumb: {
    display: "none"
  },
  active: {
    backgroundColor: "#42c9ff"
  }
};

const ProgressBar: FunctionComponent<ProgressBarProps> = ({ duration }) => {
  const player = useContext(PlayerContext);

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const intervalId = setInterval(
      () => setProgress(Tone.Transport.seconds / duration),
      500
    );

    return () => clearInterval(intervalId);
  }, [duration]);

  const handleChange = ({ x }) => {
    player.seek(x / 100);
  };

  return (
    <>
      <Slider
        styles={progressBarStyles}
        axis="x"
        x={progress * 100}
        onChange={handleChange}
      />
      <span className={timeCn}>{formatTime((1 - progress) * duration)}</span>
    </>
  );
};

export default memo(ProgressBar);
