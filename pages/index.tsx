import * as React from "react";
import dynamic from "next/dynamic";
import { bodyClass, playerWrapper } from "./styles/main.styles";
import { connect } from "react-redux";
import Header from "@components/Header";

// @ts-ignore
const SoundPlayer = dynamic(import("@components/SoundPlayer"));

function App() {
  return (
    <div className={bodyClass}>
      <Header />
      <div className={playerWrapper}>
        <SoundPlayer />
      </div>
    </div>
  );
}

export default connect()(App);
