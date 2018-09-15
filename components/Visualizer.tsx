import * as React from "react";
import { visualizerWrapper } from "@components/styles/SoundPlayer.styles";
import CanvasWorker from "@workers/canvas.worker";
import { Track } from "midiconvert";
import { debounce } from "lodash"
import {VISUALIZER_MESSAGES} from "@enums/visulaizerMessages";

const canvasWorker: Worker = new CanvasWorker();

interface VisualizerProps {
	range: {
		first: number;
		last: number;
	}
}

export default class extends React.PureComponent<VisualizerProps> {
  private canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();
  private visualizerRef: React.RefObject<HTMLDivElement> = React.createRef();
  private debouncedSetDimensions: (e: Event, update: boolean) => void;

  constructor (props) {
  	super(props);

  	this.debouncedSetDimensions = debounce(this.setDimensions, 1000)
	}

  state = {
  	dimensions: {
  		width: 1100,
			height: 400
		}
	};

  private setDimensions = (_e, update = true) => {
  	const { width, height } = this.visualizerRef.current.getBoundingClientRect();
		this.setState({
			dimensions: {
				width,
				height
			}
		}, () => {
			if (!update) return;
			// @ts-ignore
			canvasWorker.postMessage({
				message: VISUALIZER_MESSAGES.UPDATE_DIMENSIONS,
				dimensions: {
					width,
					height
				}
			})
		})
	};

  componentDidMount() {
		this.setDimensions(null, false);

		// @ts-ignore
		const offscreen = this.canvasRef.current.transferControlToOffscreen();

		const dimensions = this.visualizerRef.current.getBoundingClientRect();
    canvasWorker.postMessage(
      {
        canvas: offscreen,
        message: VISUALIZER_MESSAGES.INIT,
				dimensions
      },
      [offscreen]
    );

    // @ts-ignore
		window.addEventListener("resize", this.debouncedSetDimensions)
  }

  componentDidUpdate (prevProps) {
  	if (prevProps.range.first !== this.props.range.first || prevProps.range.last !== this.props.range.last) {
  		canvasWorker.postMessage({
				message: VISUALIZER_MESSAGES.UPDATE_RANGE,
				range: this.props.range
			})
		}
	}

  public play = (track: Track, range: { first: number; last: number }) => {
    canvasWorker.postMessage({
      track,
      range,
			message: VISUALIZER_MESSAGES.PLAY
    });
  };

  render() {
  	const { width, height } = this.state.dimensions;

    return (
      <div className={visualizerWrapper} ref={this.visualizerRef}>
				<canvas
          width={width}
          height={height}
          style={{ height }}
          ref={this.canvasRef}
        />}
      </div>
    );
  }
}
