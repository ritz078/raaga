import { css } from "emotion";

export const loaderClass = css({
  position: "absolute",
  zIndex: 10
});

export const piano = css({
  display: "flex",
  justifyContent: "center",
  width: "100%",
  position: "relative",
  overflowX: "hidden"
});

export const pianoWrapper = css([
  piano,
  {
    alignItems: "center",
    borderTop: "1px solid #000"
  }
]);

export const flexOne = css({
  display: "flex",
  flex: 1,
  position: "relative",
  flexDirection: "column"
});

export const toastStyle = css({
  position: "absolute",
  bottom: 20,
  right: 20,
  left: "auto",
  transform: "translateX(0) !important"
});
