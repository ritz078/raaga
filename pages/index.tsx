import * as React from "react";
import dynamic from "next/dynamic";
import { bodyClass, headerClass, playerWrapper } from "./styles/main.styles";

// @ts-ignore
const SoundPlayer = dynamic(import("@components/SoundPlayer"));

export default function() {
  return (
    <div className={bodyClass}>
      <header className={headerClass}>Hello</header>
      <div className={playerWrapper}>
        <SoundPlayer />
      </div>
    </div>
  );
}
