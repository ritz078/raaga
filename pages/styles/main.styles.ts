import { css } from "emotion";
import hex2rgba from "hex-to-rgba";
import { colors, mixins } from "@anarock/pebble";

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
  height: 80,
  position: "absolute",
  width: "100%",
  background: `linear-gradient(to bottom, #000 0%, rgba(0,0,0,0) 100%)`,
  zIndex: 9,
  ...mixins.flexSpaceBetween,
  alignItems: "center",
  padding: "0 30px",
  i: {
    cursor: "pointer",
    padding: "28px 20px",
    color: "#e7e7e7",
    fontSize: 20,
    transition: "all 200ms",
    "&:hover": {
      color: colors.white.base
    }
  }
});

export const playerWrapper = css({
  flex: 1,
  display: "flex",
  flexDirection: "column"
});
