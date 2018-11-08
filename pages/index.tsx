import * as React from "react";
import dynamic from "next/dynamic";
import { betaBanner, bodyClass, playerWrapper } from "./styles/main.styles";

// @ts-ignore
const SoundPlayer = dynamic(() => import("@components/SoundPlayer"), {
  ssr: false
});

function App() {
  return (
    <div className={bodyClass}>
      <div className={betaBanner}>
        This is a beta release. Please report bugs{" "}
        <a href="https://github.com/ritz078/synth/issues" target="_blank">
          on GitHub.
        </a>
      </div>
      <div className={playerWrapper}>
        <SoundPlayer />
      </div>
    </div>
  );
}

export default App;
