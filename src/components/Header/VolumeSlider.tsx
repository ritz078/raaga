import React, { FunctionComponent } from "react";
import { getTrackBackground, Range as RangeSlider } from "react-range";

interface VolumeSliderProps {
  disabled: boolean;
  onVolumeChange: (volume: number) => void;
  volume: number;
}

const VOLUME_MIN = -10;
const VOLUME_MAX = 10;

export const VolumeSlider: FunctionComponent<VolumeSliderProps> = ({
  disabled,
  onVolumeChange,
  volume
}) => {
  return (
    <RangeSlider
      step={1}
      min={VOLUME_MIN}
      max={VOLUME_MAX}
      values={[volume]}
      disabled={disabled}
      onChange={(values) => onVolumeChange(values[0])}
      renderTrack={({ props, children }) => (
        <div
          onMouseDown={props.onMouseDown as any}
          onTouchStart={props.onTouchStart}
          className="h-10 flex"
          style={{ ...props.style, opacity: disabled ? 0.5 : 1 }}
        >
          <div
            ref={props.ref}
            className="h-1 w-full self-center rounded"
            style={{
              width: 120,
              background: getTrackBackground({
                values: [volume],
                colors: ["#2196f3", "#ccc"],
                min: VOLUME_MIN,
                max: VOLUME_MAX
              })
            }}
          >
            {children}
          </div>
        </div>
      )}
      renderThumb={({ props }) => (
        <div {...props} style={props.style}>
          <div className="prs-thumb" />
        </div>
      )}
    />
  );
};
