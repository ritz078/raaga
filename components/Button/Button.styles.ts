import { css } from "emotion";

export const uploadButton = css({
  fontSize: 14,
  color: "#e6e6e6",
  backgroundColor: "rgba(255, 255, 255, 0.12)",
  padding: "10px 15px",
  borderRadius: 2,
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  transition: "all 200ms",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.05)"
  }
});
