import { ReactComponent as DrumSet } from "@assets/images/instruments/drum-set.svg";
import { ReactComponent as AcousticGuitar } from "@assets/images/instruments/acoustic-guitar.svg";
import * as React from "react";
import { Icon } from "@components/Icon";

interface InstrumentCardProps {
  instrumentName: string;
  drums?: boolean;
  isSelected: boolean;
  onClick?: () => void;
  disabled?: boolean;
  onIconClick?: () => void;
}

const InstrumentCard: React.FunctionComponent<InstrumentCardProps> = ({
  instrumentName,
  drums = false,
  isSelected,
  onClick,
  disabled,
  onIconClick
}) => {
  const _onIconClick = e => {
    e.stopPropagation();
    onIconClick && onIconClick();
  };

  return (
    <div
      className="instrument-card"
      onClick={onClick}
      style={{
        borderColor: isSelected ? "#4CAF50" : "transparent"
      }}
    >
      <div className="instrument-illustration">
        {drums ? <DrumSet height={35} /> : <AcousticGuitar height={35} />}
      </div>

      <div className="flex flex-col justify-between ml-2">
        <span className="text-xs capitalize text-gray-400">
          {instrumentName}
        </span>

        <div
          onClick={_onIconClick}
          className="w-5"
          style={{
            opacity: !onIconClick ? 0.2 : 1
          }}
        >
          {disabled ? (
            <Icon name="volume-off" color="red" size={12} className="mb-1" />
          ) : (
            <Icon name="volume" color="#b5b5b5" size={12} className="mb-1" />
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(InstrumentCard);
