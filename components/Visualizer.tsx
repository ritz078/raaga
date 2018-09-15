import * as React from "react";
import CanvasWorker from "@workers/canvas.worker";
import { Track } from "midiconvert";
import { debounce } from "lodash";
import {VISUALIZER_MESSAGES, VISUALIZER_MODE} from "@enums/visualizerMessages";
import { Range } from "@utils/typings/Visualizer";
import { getNaturalKeysInRange } from "@utils";
import {
  noteSection,
  noteSectionWrapper,
  visualizerWrapper
} from "@components/styles/Visualizer.styles";
import {css, cx} from "emotion";

const canvasWorker: Worker = new CanvasWorker();

interface VisualizerProps {
  range: Range;
  mode: VISUALIZER_MODE
}

export default class extends React.PureComponent<VisualizerProps> {
  private canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();
  private visualizerRef: React.RefObject<HTMLDivElement> = React.createRef();
  private debouncedSetDimensions: (e: Event, update: boolean) => void;

  constructor(props) {
    super(props);

    this.debouncedSetDimensions = debounce(this.setDimensions, 1000);
  }

  state = {
    dimensions: {
      width: 1100,
      height: 400
    }
  };


  private setDimensions = (_e, update = true) => {
    const {
      width,
      height
    } = this.visualizerRef.current.getBoundingClientRect();
    this.setState(
      {
        dimensions: {
          width,
          height
        }
      },
      () => {
        if (!update) return;
        // @ts-ignore
        canvasWorker.postMessage({
          message: VISUALIZER_MESSAGES.UPDATE_DIMENSIONS,
          dimensions: {
            width,
            height
          }
        });
      }
    );
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
        dimensions,
				range: this.props.range
      },
      [offscreen]
    );

    // @ts-ignore
    window.addEventListener("resize", this.debouncedSetDimensions);
  }

  componentWillUnmount() {
    // @ts-ignore
    window.removeEventListener("resize", this.debouncedSetDimensions);
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.range.first !== this.props.range.first ||
      prevProps.range.last !== this.props.range.last
    ) {
      canvasWorker.postMessage({
        message: VISUALIZER_MESSAGES.UPDATE_RANGE,
        range: this.props.range
      });
    }

    if (prevProps.mode !== this.props.mode) {
    	canvasWorker.postMessage({
				message: VISUALIZER_MESSAGES.SET_MODE,
				mode: this.props.mode
			})
		}
  }

  public start = (track: Track, range: { first: number; last: number }) => {
    canvasWorker.postMessage({
      track,
      range,
      message: VISUALIZER_MESSAGES.PLAY
    });
  };

  public stop = () => {
    canvasWorker.postMessage({
      message: VISUALIZER_MESSAGES.STOP
    });
  };

  public addNote = (midi) => {
  	canvasWorker.postMessage({
			message: VISUALIZER_MESSAGES.ADD_NOTE,
			midi
		})
	};

  public stopNote = (midi) => {
  	canvasWorker.postMessage({
			message: VISUALIZER_MESSAGES.END_NOTE,
			midi
		})
	};

  render() {
    const { width, height } = this.state.dimensions;

    const className = cx(visualizerWrapper, {
    	[css({
				transform: "rotate(180deg) scaleX(-1)"
			})]: this.props.mode === VISUALIZER_MODE.READ
		});

    return (
      <div className={className} ref={this.visualizerRef}>
        <canvas
          width={width}
          height={height}
          style={{ height }}
          ref={this.canvasRef}
        />

        <div className={noteSectionWrapper}>
          {getNaturalKeysInRange(this.props.range).map(x => (
            <div className={noteSection} key={x} />
          ))}
        </div>
      </div>
    );
  }
}
