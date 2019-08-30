import * as React from "react";
import dynamic from "next/dynamic";
import { ReactComponent as Loader } from "@assets/images/loader.svg";

const SoundPlayer = dynamic((() => import("@components/SoundPlayer")) as any, {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen flex flex-1 items-center justify-center">
      <Loader />
    </div>
  )
});

function Main() {
  return (
    <div className="bg-black h-screen overflow-hidden flex flex-col w-full min-w-1100">
      <div className="flex flex-1 flex-col">
        <SoundPlayer />
      </div>
    </div>
  );
}

export default Main;
