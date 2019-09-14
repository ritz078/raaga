import * as React from "react";
import dynamic from "next/dynamic";
import { Error } from "@components/Error";
import { Loader } from "@components/Loader";
import { useEffect, useState } from "react";
import { OFFSCREEN_2D_CANVAS_SUPPORT } from "@enums/offscreen2dCanvasSupport";

const Loading = () => (
  <div className="h-screen w-screen flex flex-1 items-center justify-center">
    <Loader />
  </div>
);

const SoundPlayer: any = dynamic(
  (() => import("@components/SoundPlayer")) as any,
  {
    ssr: false,
    loading: () => <Loading />
  }
);

function Main() {
  const [
    is2dOffscreenCanvasSupported,
    setIs2dOffscreenCanvasSupported
  ] = useState(OFFSCREEN_2D_CANVAS_SUPPORT.DETERMINING);

  useEffect(() => {
    (async function() {
      const { checkSupportFor2dOffscreenCanvas } = await import(
        "@utils/isOffscreenCanvasSupported"
      );
      const support = await checkSupportFor2dOffscreenCanvas();
      setIs2dOffscreenCanvasSupported(support);
    })();
  }, []);

  return (
    <div className="bg-black h-screen overflow-hidden flex flex-col w-full min-w-1100">
      <Error />
      <div className="flex flex-1 flex-col overflow-hidden">
        {is2dOffscreenCanvasSupported !==
        OFFSCREEN_2D_CANVAS_SUPPORT.DETERMINING ? (
          <SoundPlayer offScreenCanvasSupport={is2dOffscreenCanvasSupported} />
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
}

export default Main;
