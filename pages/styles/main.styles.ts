import { css } from "emotion";

export const bodyClass = css({
  minWidth: 1100,
  backgroundColor: "#000",
  background: `linear-gradient(to top right,#000,rgba(0,0,0,0.9)), url(/static/images/background.jpg)`,
  backgroundSize: "cover",
  height: "100vh",
  flexDirection: "column",
  display: "flex",
  width: "100%"
});

export const playerWrapper = css({
  flex: 1,
  display: "flex",
  flexDirection: "column"
});
