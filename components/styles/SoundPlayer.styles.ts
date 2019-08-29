import { css } from "emotion";
import { PIANO_HEIGHT } from "@config/piano";

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
    borderTop: "1px solid #000",
    height: PIANO_HEIGHT
  }
]);

export const flexOne = css({
  display: "flex",
  flex: 1,
  position: "relative",
  flexDirection: "column"
});
