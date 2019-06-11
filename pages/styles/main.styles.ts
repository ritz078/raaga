import { css } from "emotion";

export const bodyClass = css({
  minWidth: 1100,
  backgroundColor: "#000",
  background: `linear-gradient(to top right,#000,rgba(0,0,0,0.9))`,
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

export const mainHeader = css({
  backgroundColor: "#232323",
  padding: "8px 30px",
  color: "white",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  "> a": {
    textDecoration: "none"
  }
});

export const betaTag = css({
  backgroundColor: "#e91e63",
  fontSize: 12,
  display: "inline-block",
  borderRadius: 2,
  padding: "3px 5px",
  marginLeft: 1,
  marginTop: -18
});
