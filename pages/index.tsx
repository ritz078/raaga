import * as React from "react";
import dynamic from "next/dynamic";
import { bodyClass, playerWrapper } from "@styles/main.styles";

const SoundPlayer = dynamic((() => import("@components/SoundPlayer")) as any, {
  ssr: false
});

function Main() {
  return (
    <div css={bodyClass}>
      <div css={playerWrapper}>
        <SoundPlayer />
      </div>
    </div>
  );
}

export default Main;
