import { css } from "emotion";

export const globalHeaderRight = css({
  display: "flex",
  alignItems: "center"
});

export const uploadButton = css({
  height: 32,
  marginRight: 15,
  fontSize: 12,
  backgroundColor: "#101010"
});

export const mainHeader = css({
  backgroundColor: "#232323",
  padding: "8px 30px",
  color: "white",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  height: 50,
  "> a": {
    textDecoration: "none"
  }
});
