import { css } from "emotion";

export const wrapper = css({
  backgroundColor: "#252525",
  borderRadius: "2px",
  display: "flex",
  alignItems: "center",
  color: "#fff",
  padding: 4,
  margin: "0 15px"
});

export const actionButton = css({
  padding: 2,
  display: "flex",
  borderRadius: "2px",
  cursor: "pointer",
  transition: "all 200ms",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.2)"
  }
});

export const speedValue = css({
  display: "block",
  fontSize: 12,
  width: 45,
  textAlign: "center"
});
