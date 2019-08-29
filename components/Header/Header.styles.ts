import { css } from "emotion";

export const headerClass = css({
  height: 48,
  width: "100%",
  backgroundColor: "#1c1c1c",
  zIndex: 10,
  padding: "0 10px",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between"
});

export const headerLeft = css({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  paddingLeft: 15
});

export const headerRight = css({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
});

export const buttonCn = css({
  padding: "8px 15px",
  fontSize: 12
});
