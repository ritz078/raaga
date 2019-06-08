import * as React from "react";
import { colors, Tooltip } from "@anarock/pebble";
import { recordingButton, recordingWrapper } from "./styles/Recorder.styles";
import { RecorderProps } from "./typings/Recorder";

interface State {
  isRecording: boolean;
}

export default class extends React.PureComponent<RecorderProps, State> {
  state = {
    isRecording: false
  };

  private toggle = () => {
    const { isRecording } = this.state;
    const { onRecordingEnd, onRecordingStart } = this.props;
    this.setState(
      {
        isRecording: !isRecording
      },
      () => {
        this.state.isRecording ? onRecordingStart() : onRecordingEnd();
      }
    );
  };

  render() {
    const { isRecording } = this.state;
    const tooltipModifier = {
      preventOverflow: {
        padding: 40
      }
    };

    return (
      <div className={recordingWrapper}>
        <Tooltip
          modifiers={tooltipModifier}
          label={({ ref }) => (
            <div
              className={recordingButton}
              style={{
                backgroundColor: isRecording
                  ? colors.red.base
                  : colors.white.base
              }}
              onClick={this.toggle}
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
  }
}
