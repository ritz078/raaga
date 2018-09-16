import * as React from "react";
import { colors, Tooltip } from "@anarock/pebble";
import { recordingButton, recordingWrapper } from "./styles/Recorder.styles";
import { RecorderProps } from "./typings/Recorder";

export default class extends React.PureComponent<RecorderProps> {
  state = {
    isRecording: false
  };

  private toggle = () => {
    this.setState(
      {
        isRecording: !this.state.isRecording
      },
      () => {
        this.state.isRecording
          ? this.props.onRecordingStart()
          : this.props.onRecordingEnd();
      }
    );
  };

  render() {
    const { isRecording } = this.state;

    return (
      <div className={recordingWrapper}>
        <Tooltip
          modifiers={{
            preventOverflow: {
              padding: 40
            }
          }}
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
