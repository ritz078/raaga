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
  width: "100%",
  backgroundColor: colors.pink.base
});

export default function() {
  return (
    <div className={main}>
      <div
        style={{
          backgroundColor: colors.gray.darker,
          height: "50vh"
        }}
      />
      <div
        style={{
          padding: "0 100px"
        }}
      >
        <SoundPlayer />
      </div>
    </div>
  );
}
