import React, { useEffect, useRef, FunctionComponent } from "react";
import {
  VISUALIZER_MESSAGES,
  VISUALIZER_MODE
} from "@enums/visualizerMessages";
import { Range } from "@utils/typings/Visualizer";
import { getNaturalKeysInRange } from "@utils";
import { offScreenCanvasIsSupported } from "@utils/isOffscreenCanvasSupported";
import { useWindowResize } from "@hooks/useWindowResize";
import cn from "@sindresorhus/class-names";
import { transfer } from "comlink";

interface VisualizerProps {
  range: Range;
  mode: VISUALIZER_MODE;
  canvasProxy: any;
}

const _Visualizer: FunctionComponent<VisualizerProps> = ({
  mode,
  range,
  canvasProxy
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);

  const dimensions = useWindowResize(visualizerRef, {
    width: 1100,
    height: 400
  });

  useEffect(() => {
    (async function() {
      const canvas: any = offScreenCanvasIsSupported
        ? canvasRef.current.transferControlToOffscreen()
        : canvasRef.current;

      // This has been done because it wasn't getting correctly transferred
      // in firefox.
      const dimensions = JSON.parse(
        JSON.stringify(visualizerRef.current.getBoundingClientRect())
      );

      await canvasProxy(
        transfer(
          {
            canvas,
            message: VISUALIZER_MESSAGES.INIT,
            dimensions,
            range,
            mode
          },
          [canvas]
        )
      );
    })();
  }, []);

  useEffect(() => {
    (async function() {
      await canvasProxy({
        message: VISUALIZER_MESSAGES.UPDATE_DIMENSIONS,
        dimensions
      });
    })();
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
