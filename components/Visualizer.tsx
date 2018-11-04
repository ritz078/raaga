import * as React from "react";
import { debounce } from "lodash";
import {
  VISUALIZER_MESSAGES,
  VISUALIZER_MODE
} from "@enums/visualizerMessages";
import { Range } from "@utils/typings/Visualizer";
import { getNaturalKeysInRange } from "@utils";
import {
  noteSection,
  noteSectionWrapper,
  visualizerWrapper
} from "@components/styles/Visualizer.styles";
import { css, cx } from "emotion";
import { CanvasWorkerFallback } from "@controllers/visualizer.controller";
import { offScreenCanvasIsSupported } from "@utils/isOffscreenCanvasSupported";

interface VisualizerProps {
  range: Range;
  mode: VISUALIZER_MODE;
  canvasWorker: CanvasWorkerFallback;
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
        this.props.canvasWorker.postMessage({
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

    let canvas;
    if (offScreenCanvasIsSupported) {
      // @ts-ignore
      canvas = this.canvasRef.current.transferControlToOffscreen();
    } else {
      canvas = this.canvasRef.current;
    }

    // This has been done because it wasn't getting correctly transferred
    // in firefox.
    const dimensions = JSON.parse(
      JSON.stringify(this.visualizerRef.current.getBoundingClientRect())
    );
    this.props.canvasWorker.postMessage(
      {
        canvas,
        message: VISUALIZER_MESSAGES.INIT,
        dimensions,
        range: this.props.range,
        mode: this.props.mode
      },
      [canvas]
    );

    // @ts-ignore
    window.addEventListener("resize", this.debouncedSetDimensions);
  }

  componentWillUnmount() {
    // @ts-ignore
    window.removeEventListener("resize", this.debouncedSetDimensions);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.mode !== this.props.mode) {
      this.props.canvasWorker.postMessage({
        message: VISUALIZER_MESSAGES.SET_MODE,
        mode: this.props.mode
      });
    }
  }

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
