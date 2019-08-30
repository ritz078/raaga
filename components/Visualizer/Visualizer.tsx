import React, { useEffect, useRef, FunctionComponent } from "react";
import {
  VISUALIZER_MESSAGES,
  VISUALIZER_MODE
} from "@enums/visualizerMessages";
import { Range } from "@utils/typings/Visualizer";
import { getNaturalKeysInRange } from "@utils";
import { CanvasWorkerFallback } from "@controllers/visualizer.controller";
import { offScreenCanvasIsSupported } from "@utils/isOffscreenCanvasSupported";
import { useWindowResize } from "@hooks/useWindowResize";
import cn from "@sindresorhus/class-names";

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

  const dimensions = useWindowResize(visualizerRef, {
    width: 1100,
    height: 400
  });

  useEffect(() => {
    const canvas = offScreenCanvasIsSupported
      ? canvasRef.current.transferControlToOffscreen()
      : canvasRef.current;

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
  }, []);

  useEffect(() => {
    canvasWorker.postMessage({
      message: VISUALIZER_MESSAGES.UPDATE_DIMENSIONS,
      dimensions
    });
  }, [dimensions]);

  const { width, height } = dimensions;

  const className = cn("vis-wrapper", {
    "read-mode": mode === VISUALIZER_MODE.READ
  });

  return (
    <div className={className} ref={visualizerRef}>
      <canvas
        width={width}
        height={height}
        style={dimensions}
        ref={canvasRef}
      />

      <div className="text-white flex flex-1 absolute flex-row inset-0">
        {getNaturalKeysInRange(range).map(x => (
          <div className="vis-note-section" key={x} />
        ))}
      </div>
    </div>
  );
};

export const Visualizer = React.memo(_Visualizer);
