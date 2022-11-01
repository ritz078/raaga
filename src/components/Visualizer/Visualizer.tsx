import React, { FunctionComponent, useContext, useEffect, useRef } from "react";
import {
  VISUALIZER_MESSAGES,
  VISUALIZER_MODE
} from "@enums/visualizerMessages";
import { Range } from "@utils/typings/Visualizer";
import { getNaturalKeysInRange } from "@utils";
import { useWindowResize } from "@hooks/useWindowResize";
import cn from "@sindresorhus/class-names";
import { OFFSCREEN_2D_CANVAS_SUPPORT } from "@enums/offscreen2dCanvasSupport";
import { ThemeContext } from "@utils/ThemeContext";

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
  const visualizerRef = useRef<HTMLDivElement>(null);
  const theme = useContext(ThemeContext);

  const dimensions = useWindowResize(visualizerRef, {
    width: 1100,
    height: 400
  });

  useEffect(() => {
    (async function () {
      const canvas: any =
        offScreenCanvasSupport === OFFSCREEN_2D_CANVAS_SUPPORT.SUPPORTED
          ? canvasRef.current.transferControlToOffscreen()
          : canvasRef.current;

      // This has been done because it wasn't getting correctly transferred
      // in firefox.
      const dimensions = JSON.parse(
        JSON.stringify(visualizerRef.current.getBoundingClientRect())
      );

      await canvasProxy(
        {
          canvas,
          message: VISUALIZER_MESSAGES.INIT,
          dimensions,
          range,
          mode,
          theme
        },
        [canvas]
      );
    })();
  }, []);

  useEffect(() => {
    (async function () {
      await canvasProxy({
        message: VISUALIZER_MESSAGES.UPDATE_DIMENSIONS,
        dimensions
      });
    })();
  }, [dimensions]);

  useEffect(() => {
    canvasProxy({
      message: VISUALIZER_MESSAGES.SET_THEME,
      theme
    });
  }, [theme]);

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
          {getNaturalKeysInRange(range).map((x) => (
            <div className="vis-note-section" key={x} />
          ))}
        </div>

        {mode === VISUALIZER_MODE.READ &&
          offScreenCanvasSupport ===
            OFFSCREEN_2D_CANVAS_SUPPORT.NOT_SUPPORTED && (
            <div className="vis-not-supported">
              Your browser doesn't support the Visualizer required by Raaga in
              Read mode. <br />
              You can listen to the music and see the notes on the piano.
            </div>
          )}
      </div>
    </>
  );
};

export const Visualizer = React.memo(_Visualizer);
