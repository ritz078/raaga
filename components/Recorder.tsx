import * as React from "react";
import { colors, Tooltip } from "@anarock/pebble";
import { recordingButton, recordingWrapper } from "./styles/Recorder.styles";
import { RecorderProps } from "./typings/Recorder";
import { FunctionComponent, useEffect, useState } from "react";

const tooltipModifier = {
  preventOverflow: {
    padding: 40
  }
};

const Recorder: FunctionComponent<RecorderProps> = ({
  onRecordingEnd,
  onRecordingStart
}) => {
  const [isRecording, setRecording] = useState(false);

  const toggle = () => setRecording(recording => !recording);

  useEffect(() => {
    isRecording ? onRecordingStart() : onRecordingEnd();
  }, [isRecording]);

  return (
    <div className={recordingWrapper}>
      <Tooltip
        modifiers={tooltipModifier}
        label={({ ref }) => (
          <div
            className={recordingButton}
            style={{
              backgroundColor: isRecording ? colors.red.base : colors.white.base
            }}
            onClick={toggle}
            ref={ref}
          >
            <i
              className="material-icons"
              style={{
                color: isRecording ? colors.white.base : colors.red.base,
                fontSize: 20
              }}
            >
              {isRecording ? "stop" : "fiber_manual_record"}
            </i>
          </div>
        )}
        text={isRecording ? "Stop Recording" : "Start Recording"}
        placement="top"
        isError
      />
    </div>
  );
};

export default Recorder;
