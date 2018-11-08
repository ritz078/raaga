import { css } from "emotion";
import { colors, mixins } from "@anarock/pebble";

export const playerWrapper = css({
  position: "absolute",
  bottom: 0,
  top: 0,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 8
});

export const playerController = css({
  ...mixins.flexSpaceBetween,
  width: 300,
  ...mixins.flexMiddleAlign,
  padding: "10px 20px",
  borderRadius: 4,
  backgroundColor: "rgba(37, 37, 37, 0.83)",
  left: 80,
  top: 20,
  position: "absolute",
  cursor: "move",
  svg: {
    cursor: "pointer"
  }
});

export const progressBar = css({
  flex: 1,
  height: 6,
  borderRadius: 3,
  backgroundColor: "rgba(255, 255, 255, 0.4)",
  margin: "0 20px",
  overflow: "hidden",
  "& .__track__": {
    backgroundColor: colors.yellow.base,
    height: "inherit",
    borderRadius: 3
  }
});

export const loadButton = css({
  color: colors.gray.darker,
  backgroundColor: colors.white.base,
  padding: "12px 20px 12px 16px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 4,
  fontSize: 14,
  cursor: "pointer",
  userSelect: "none",
  marginTop: 50,
  maxWidth: 200
});

export const loadFileWrapper = css({
  color: colors.white.base,
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  textAlign: "center",
  h3: {
    lineHeight: "35px",
    fontWeight: "normal"
  }
});
