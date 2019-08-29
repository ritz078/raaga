import { css } from "emotion";

export const midiWrapper = css({
  padding: 30,
  backgroundColor: "white",
  borderRadius: 4,
  textAlign: "center",
  color: "#6B7785",
  fontSize: 14,
  lineHeight: "22px",
  userSelect: "none"
});

export const noMidiIconWrapper = css({
  display: "flex",
  justifyContent: "center",
  marginBottom: 20,
  textAlign: "center"
});

export const deviceAvailable = css({
  position: "absolute",
  display: "inline-block",
  top: 25,
  marginLeft: -26
});
