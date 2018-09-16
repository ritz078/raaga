import { css } from "emotion";
import { colors } from "@anarock/pebble";

export const recordingWrapper = css({
  cursor: "pointer"
});

export const recordingButton = css({
  backgroundColor: colors.gray.darker,
  height: 26,
  width: 26,
  borderRadius: 50,
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: 10,
  transition: "all 200ms",
  border: `2px solid ${colors.white.base}`,
  userSelect: "none",
  i: {
    pointerEvents: "none"
  }
});
