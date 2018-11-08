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
  width: 350,
  padding: 14,
  borderRadius: 4,
  backgroundColor: "rgba(37, 37, 37, 0.83)",
  right: 80,
  top: 100,
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
  maxWidth: 200,
  outline: "none",
  border: 0,
  margin: "50px 10px"
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

export const midiNameStyle = css({
  fontSize: 14,
  color: colors.white.base,
  marginBottom: 10,
  borderBottom: `1px solid #2b2b2b`,
  paddingBottom: 10,
  ...mixins.flexSpaceBetween
});

export const controllerBottom = css({
  ...mixins.flexSpaceBetween,
  flex: 1,
  alignItems: "center",
  width: "100%"
});

export const loadFileIcon = css({
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  borderRadius: 2,
  width: 58,
  marginLeft: 20,
  cursor: "pointer",
  display: "flex",
  flexDirection: "column",
  fontSize: 12,
  color: colors.white.base,
  ...mixins.flexMiddleAlign
});
