import * as React from "react";
import dynamic from "next/dynamic";

const SoundPlayer = dynamic((() => import("@components/SoundPlayer")) as any, {
  ssr: false
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
