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
    borderTop: "5px solid #000"
  }
]);

export const flexOne = css({
  display: "flex",
  flex: 1
});
