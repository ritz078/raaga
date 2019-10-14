import React, { FunctionComponent, useEffect, useRef } from "react";
import {
  VISUALIZER_MESSAGES,
  VISUALIZER_MODE
} from "@enums/visualizerMessages";
import { Range } from "@utils/typings/Visualizer";
import { getNaturalKeysInRange } from "@utils";
import { useWindowResize } from "@hooks/useWindowResize";
import cn from "@sindresorhus/class-names";
import { transfer } from "comlink";
import { OFFSCREEN_2D_CANVAS_SUPPORT } from "@enums/offscreen2dCanvasSupport";
import updateLoop from "@utils/updateLoop";

interface VisualizerProps {
  range: Range;
  mode: VISUALIZER_MODE;
  canvasProxy: any;
  offScreenCanvasSupport: OFFSCREEN_2D_CANVAS_SUPPORT;
}

const _Visualizer: FunctionComponent<VisualizerProps> = ({
  mode,
  range,
  canvasProxy,
  offScreenCanvasSupport
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasElement = useRef<HTMLCanvasElement>(
    document.createElement("canvas")
  ).current;

  const visualizerRef = useRef<HTMLDivElement>(null);

  const dimensions = useWindowResize(visualizerRef, {
    width: 1100,
    height: 400
  });

  const isOffscreenSupported =
    offScreenCanvasSupport === OFFSCREEN_2D_CANVAS_SUPPORT.SUPPORTED;

  // @ts-ignore

  useEffect(() => {
    let loop;
    (async function() {
      // This has been done because it wasn't getting correctly transferred
      // in firefox.
      const canvas: any = false //isOffscreenSupported
        ? canvasRef.current.transferControlToOffscreen()
        : canvasRef.current;
      const dimensions = JSON.parse(
        JSON.stringify(visualizerRef.current.getBoundingClientRect())
      );
      // TODO: mimicking no offscreencanvas support, remove later
      if (false && isOffscreenSupported) {
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
      } else {
        function paintToMainCanvas() {
          if (!canvas) return;
          const mainCanvasContext = (canvas as HTMLCanvasElement).getContext(
            "2d"
          );
          mainCanvasContext.clearRect(
            0,
            0,
            hiddenCanvasElement.width,
            hiddenCanvasElement.height
          );
          mainCanvasContext.drawImage(
            hiddenCanvasElement,
            0,
            0,
            hiddenCanvasElement.width,
            hiddenCanvasElement.height
          );
        }
        loop = updateLoop(paintToMainCanvas);
        loop.start();
        // else use hidden canvas
        canvasProxy({
          canvas: hiddenCanvasElement,
          message: VISUALIZER_MESSAGES.INIT,
          dimensions,
          range,
          mode
        });
        // set up the cycle to repaint the main canvas
      }
    })();
    return () => {
      loop.stop();
    };
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
    <>
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
    </>
  );
};

export const Visualizer = React.memo(_Visualizer);
