import { css } from "emotion";

export const headerClass = css({
  height: 65,
  position: "absolute",
  top: 50,
  width: "100%",
  background: `linear-gradient(to bottom, #000 0%, rgba(0,0,0,0) 100%)`,
  zIndex: 10,
  padding: "0 10px",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between"
});

export const headerRight = css({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
});

export const instrumentLabel = css({
  display: "inline-flex",
  color: "#fff",
  backgroundColor: "rgba(47,47,47,0.8)",
  padding: "12px 20px",
  borderRadius: 4,
  fontSize: 13,
  cursor: "pointer",
  marginLeft: 20,
  marginRight: 10,
  outline: "none",
  border: "none"
});
