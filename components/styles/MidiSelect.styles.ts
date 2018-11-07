import { css } from "emotion";
import { colors } from "@anarock/pebble";

export const midiWrapper = css({
  padding: 30,
  backgroundColor: "white",
  borderRadius: 4,
  width: 300,
  textAlign: "center",
  color: colors.gray.dark,
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
