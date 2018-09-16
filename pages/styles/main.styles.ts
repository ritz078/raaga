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

export const headerClass = css({
  height: 100,
  position: "absolute",
  width: "100%",
  background:
    "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
  zIndex: 9
});

export const playerWrapper = css({
  flex: 1,
  display: "flex",
  flexDirection: "column"
});
