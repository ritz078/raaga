import { css } from "emotion";
import { colors } from "@anarock/pebble";

export const progressWrapper = css({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: 50
});

export const progressCircle = css({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: colors.white.base,
  position: "absolute"
});
