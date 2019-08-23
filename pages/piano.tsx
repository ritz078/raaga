import React, { useEffect, useRef, useState } from "react";
import { Piano } from "@utils/Piano";
import { getPianoRangeAndShortcuts } from "@utils/keyboard";
import { PIANO_HEIGHT } from "@config/piano";

const { range } = getPianoRangeAndShortcuts([38, 88]);

export default function() {
  const canvasRef = useRef(null);

  const [dimensions, setDimensions] = useState({
    width: 1100,
    height: PIANO_HEIGHT
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const piano = new Piano(canvas, range, dimensions);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      height={dimensions.height}
      width={dimensions.width}
    />
  );
}
