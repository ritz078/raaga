import { css } from "emotion";
import { colors, mixins } from "@anarock/pebble";

export const playerWrapper = css({
  position: "absolute",
  bottom: 0,
  top: 50,
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
  height: 4,
  borderRadius: 2,
  backgroundColor: "rgba(255, 255, 255, 0.4)",
  margin: "0 15px",
  minWidth: 150,
  overflow: "hidden",
  "& .__track__": {
    backgroundColor: "#42c9ff",
    height: "inherit",
    borderRadius: 3
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

export const timeCn = css({
  color: "#fff",
  display: "inline-flex",
  width: 50,
  fontSize: 12
});
