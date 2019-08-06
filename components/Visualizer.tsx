import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  FunctionComponent,
  useMemo
} from "react";
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

const Visualizer: FunctionComponent<VisualizerProps> = ({
  mode,
  range,
  canvasWorker
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState({
    width: 1100,
    height: 400
  });

  const updateDimensions = useCallback(() => {
    const { width, height } = visualizerRef.current.getBoundingClientRect();
    setDimensions({ width, height });
  }, [visualizerRef]);

  const debouncedSetDimensions = useMemo(
    () => debounce(updateDimensions, 1000),
    [updateDimensions]
  );

  useEffect(() => {
    updateDimensions();

    let canvas;
    if (offScreenCanvasIsSupported) {
      canvas = canvasRef.current.transferControlToOffscreen();
    } else {
      canvas = canvasRef.current;
    }

    // This has been done because it wasn't getting correctly transferred
    // in firefox.
    const dimensions = JSON.parse(
      JSON.stringify(visualizerRef.current.getBoundingClientRect())
    );

    canvasWorker.postMessage(
      {
        canvas,
        message: VISUALIZER_MESSAGES.INIT,
        dimensions,
        range,
        mode
      },
      [canvas]
    );

    window.addEventListener("resize", debouncedSetDimensions);

    return () => window.removeEventListener("resize", debouncedSetDimensions);
  }, []);

  useEffect(() => {
    canvasWorker.postMessage({
      message: VISUALIZER_MESSAGES.UPDATE_DIMENSIONS,
      dimensions
    });
  }, [dimensions]);

  useEffect(() => {
    canvasWorker.postMessage({
      message: VISUALIZER_MESSAGES.SET_MODE,
      mode
    });
  }, [mode]);

  const { width, height } = dimensions;

  const className = cx(visualizerWrapper, {
    [css({
      transform: "rotate(180deg) scaleX(-1)"
    })]: mode === VISUALIZER_MODE.READ
  });

  return (
    <div className={className} ref={visualizerRef}>
      <canvas
        width={width}
        height={height}
        style={dimensions}
        ref={canvasRef}
      />

      <div className={noteSectionWrapper}>
        {getNaturalKeysInRange(range).map(x => (
          <div className={noteSection} key={x} />
        ))}
      </div>
    </div>
  );
};

export default Visualizer;
