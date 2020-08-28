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
  (() => import("@components/SoundPlayer")),
  {
    ssr: false,
    loading: ({error}) => {
      console.log(error)
      return <Loading />
    }
  }
);

function Main() {
  const [
    is2dOffscreenCanvasSupported,
    setIs2dOffscreenCanvasSupported
  ] = useState(OFFSCREEN_2D_CANVAS_SUPPORT.DETERMINING);

  const [webMidiEnabled, setWebMidiEnabled] = useState(null);

  useEffect(() => {
    (async function() {
      const {
        checkSupportFor2dOffscreenCanvas
      } = require("@utils/isOffscreenCanvasSupported");
      const support = await checkSupportFor2dOffscreenCanvas();
      setIs2dOffscreenCanvasSupported(support);
    })();
  }, []);


  useEffect(() => {
    const webMidi = require("webmidi");
    webMidi.enable(err => {
      setWebMidiEnabled(!err && webMidi.enabled);
    });
  }, []);

  return (
    <div className="bg-black h-screen overflow-hidden flex flex-col w-full min-w-1100">
      <Error />
      <div className="flex flex-1 flex-col overflow-hidden">
        {is2dOffscreenCanvasSupported !==
          OFFSCREEN_2D_CANVAS_SUPPORT.DETERMINING && webMidiEnabled !== null ? (
          <SoundPlayer
            webMidiEnabled={webMidiEnabled}
            offScreenCanvasSupport={is2dOffscreenCanvasSupported}
          />
        ) : (
          <Loading />
        )}
      </div>
    </div>
  );
}

export default Main;
