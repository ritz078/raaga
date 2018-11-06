import { css } from "emotion";
import { colors } from "@anarock/pebble";

export const midiWrapper = css({
  padding: 30,
  backgroundColor: "white",
  borderRadius: 4,
  minWidth: 200,
  textAlign: "center",
  color: colors.gray.dark,
  maxWidth: 300,
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
