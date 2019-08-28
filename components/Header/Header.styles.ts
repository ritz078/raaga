import { css } from "emotion";
import { colors, mixins } from "@anarock/pebble";

export const headerClass = css({
  height: 48,
  width: "100%",
  backgroundColor: "#1c1c1c",
  zIndex: 10,
  padding: "0 10px",
  ...mixins.flexSpaceBetween
});

export const headerLeft = css({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  paddingLeft: 15
});

export const headerRight = css({
  ...mixins.flexSpaceBetween,
  alignItems: "center"
});

export const buttonCn = css({
  padding: "8px 15px",
  fontSize: 12
});

export const recordBtn = css({
  color: colors.red.base,
  fontSize: 13,
  backgroundColor: colors.white.base,
  height: 40,
  padding: "0 15px",
  borderRadius: 20,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: "0 20px",
  marginRight: 10,
  cursor: "pointer",
  outline: 0,
  border: 0
});
