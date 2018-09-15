import * as React from "react";
import dynamic from "next/dynamic";
import { css } from "emotion";
import {colors} from "@anarock/pebble";
import hex2rgba from "hex-to-rgba";

const bodyClass = css({
	minWidth: 1100,
	background: `linear-gradient(to top right,${hex2rgba(colors.gray.darker, 0.9)},${hex2rgba("#000", 0.9)}), url(/static/images/background.jpg)`,
	backgroundSize: "cover",
	height: "100vh",
	flexDirection: "column",
	display: "flex",
	width: "100%"
});

// @ts-ignore
const SoundPlayer = dynamic(import("@components/SoundPlayer"));

export default function() {
  return (
    <div className={bodyClass}>
      <div
        style={{
          padding: "30px",
					flex: 1,
					display: "flex",
					flexDirection: "column"
        }}
      >
        <SoundPlayer />
      </div>
    </div>
  );
}
