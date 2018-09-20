import * as React from "react";
import dynamic from "next/dynamic";
import { bodyClass, playerWrapper } from "./styles/main.styles";
import { connect } from "react-redux";

// @ts-ignore
const SoundPlayer = dynamic(import("@components/SoundPlayer"));

function App() {
  return (
    <div className={bodyClass}>
      <div className={playerWrapper}>
        <SoundPlayer />
      </div>
    </div>
  );
}

export default connect()(App);
