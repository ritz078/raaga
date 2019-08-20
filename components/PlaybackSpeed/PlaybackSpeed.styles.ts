import { css } from "emotion";

export const wrapper = css({
  backgroundColor: "rgba(64, 64, 64, 0.2)",
  borderRadius: "2px",
  display: "flex",
  alignItems: "center",
  color: "#fff",
  padding: 4,
  margin: "0 15px"
});

export const actionButton = css({
  padding: "5px",
  display: "flex",
  backgroundColor: "rgba(255, 255, 255, 0.04)",
  borderRadius: "2px",
  cursor: "pointer",
  transition: "all 200ms",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.2)"
  }
});

export const speedValue = css({
  display: "inline-flex",
  padding: "0 10px"
});
