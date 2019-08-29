import { css } from "emotion";

export const timeCn = css({
  color: "#fff",
  display: "inline-flex",
  width: 35,
  fontSize: 12
});

export const progressBar = css({
  flex: 1,
  height: 4,
  borderRadius: 2,
  backgroundColor: "rgba(255, 255, 255, 0.4)",
  margin: "0 15px",
  minWidth: 100,
  overflow: "hidden",
  "& .__track__": {
    backgroundColor: "#42c9ff",
    height: "inherit",
    borderRadius: 3
  }
});
