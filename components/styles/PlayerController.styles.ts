import { css } from "emotion";
import { colors, mixins } from "@anarock/pebble";

export const playerController = css({
  position: "absolute",
  width: 400,
  height: 40,
  padding: 20,
  borderRadius: 4,
  backgroundColor: "rgba(255, 255, 255, 0.15)",
  zIndex: 99,
  cursor: "move",
  overflow: "visible",
  ...mixins.flexSpaceBetween,
  ...mixins.flexMiddleAlign,
  color: colors.white.base,
  i: {
    cursor: "pointer",
    fontSize: 14
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
