import { css } from "emotion";
import { GLOBAL_HEADER_HEIGHT } from "@config/piano";

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
  borderBottom: "1px solid #131313",
  height: GLOBAL_HEADER_HEIGHT,
  "> a": {
    textDecoration: "none"
  }
});
