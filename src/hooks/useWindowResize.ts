import { RefObject, useEffect, useState } from "react";
import { debounce } from "lodash";
import { Dimensions } from "@utils/typings/Visualizer";

export function useWindowResize(
  ref: RefObject<HTMLElement>,
  initialDimensions: Dimensions
): Dimensions {
  const [dimensions, setDimensions] = useState(initialDimensions);

  useEffect(() => {
    const updateDimensions = () => {
      const { width, height } = ref.current.getBoundingClientRect();
      setDimensions({ width, height });
    };

    updateDimensions();

    const debounced = debounce(updateDimensions, 1000);

    window.addEventListener("resize", debounced);

    return () => {
      window.removeEventListener("resize", debounced);
    };
  }, []);

  return dimensions;
}
