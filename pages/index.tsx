import * as React from "react";
import dynamic from "next/dynamic";
import { css } from "emotion";
import { colors } from "@anarock/pebble";

// @ts-ignore
const SoundPlayer = dynamic(import("@components/SoundPlayer"));

const main = css({
  height: "100vh",
  flexDirection: "column",
  display: "flex",
  width: "100%"
});

export default function() {
  return (
    <div className={main}>
      <div
        style={{
          height: "50vh"
        }}
      />
      <div
        style={{
          padding: "0 30px"
        }}
      >
        <SoundPlayer />
      </div>
    </div>
  );
}
