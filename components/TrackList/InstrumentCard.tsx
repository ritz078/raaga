import { ReactComponent as DrumSet } from "@assets/images/instruments/drum-set.svg";
import { ReactComponent as AcousticGuitar } from "@assets/images/instruments/acoustic-guitar.svg";
import * as React from "react";

interface InstrumentCardProps {
  instrumentName: string;
  drums?: boolean;
  isSelected: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const InstrumentCard: React.FunctionComponent<InstrumentCardProps> = ({
  instrumentName,
  drums = false,
  isSelected,
  onClick,
  disabled
}) => {
  return (
    <div
      className="instrument-card"
      onClick={onClick}
      style={{
        borderColor: isSelected ? "#4CAF50" : "transparent",
        opacity: disabled ? 0.3 : undefined
      }}
    >
      <div className="instrument-illustration">
        {drums ? <DrumSet height={35} /> : <AcousticGuitar height={35} />}
      </div>

      <div className="flex flex-col justify-between ml-2">
        <span className="text-xs capitalize text-gray-400">
          {instrumentName}
        </span>
      </div>
    </div>
  );
};

export default React.memo(InstrumentCard);
