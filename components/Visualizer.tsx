import React, { useEffect, useRef, useState, FunctionComponent } from "react";
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
import { CanvasWorkerFallback } from "@controllers/visualizer.controller";
import { offScreenCanvasIsSupported } from "@utils/isOffscreenCanvasSupported";

interface VisualizerProps {
  range: Range;
  mode: VISUALIZER_MODE;
  canvasWorker: CanvasWorkerFallback;
}

const _Visualizer: FunctionComponent<VisualizerProps> = ({
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

  useEffect(() => {
    let canvas;
    if (offScreenCanvasIsSupported) {
      canvas = canvasRef.current.transferControlToOffscreen();
    } else {
      canvas = canvasRef.current;
    }

    const updateDimensions = () => {
      const { width, height } = visualizerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    };

    const debounced = debounce(updateDimensions, 1000);

    updateDimensions();

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

    window.addEventListener("resize", debounced);

    return () => window.removeEventListener("resize", debounced);
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

  return (
    <div
      css={{
        ...visualizerWrapper,
        ...(mode === VISUALIZER_MODE.READ
          ? {
              transform: "rotate(180deg) scaleX(-1)"
            }
          : {})
      }}
      ref={visualizerRef}
    >
      <canvas
        width={width}
        height={height}
        style={dimensions}
        ref={canvasRef}
      />

      <div css={noteSectionWrapper}>
        {getNaturalKeysInRange(range).map(x => (
          <div css={noteSection} key={x} />
        ))}
      </div>
    </div>
  );
};

export default React.memo(_Visualizer);
