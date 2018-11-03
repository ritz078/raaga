import { css } from "emotion";
import hex2rgba from "hex-to-rgba";
import { colors } from "@anarock/pebble";

export const bodyClass = css({
  minWidth: 1100,
  background: `linear-gradient(to top right,${hex2rgba(
    colors.gray.darker,
    0.9
  )},${hex2rgba("#000", 0.9)}), url(/static/images/background.jpg)`,
  backgroundSize: "cover",
  height: "100vh",
  flexDirection: "column",
  display: "flex",
  width: "100%"
});

export const playerWrapper = css({
  flex: 1,
  display: "flex",
  flexDirection: "column"
});
