import { css } from "emotion";

export const modeToggleWrapper = css({
  backgroundColor: "#000",
  height: 34,
  width: 180,
  padding: 5,
  borderRadius: 20,
  display: "flex",
  position: "relative",
  flexDirection: "row",
  color: "#E0E0E0",
  justifyItems: "center",
  userSelect: "none",
  cursor: "pointer",
  marginRight: 15,
  "& > div": {
    flex: 1,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    zIndex: 9
  },
  "&.__disabled__": {
    opacity: 0.6,
    cursor: "not-allowed"
  }
});

export const modeBackground = css({
  position: "absolute",
  width: "50%",
  height: 24,
  borderRadius: 17,
  backgroundColor: "rgba(230, 230, 230, 0.16)",
  transition: "all 200ms",
  "&.__write__": {
    transform: "translateX(90%)"
  }
});
