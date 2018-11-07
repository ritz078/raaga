import { css } from "emotion";
import { colors, mixins } from "@anarock/pebble";

export const iconClass = css({
  display: "inline-block",
  padding: "0 14px",
  cursor: "pointer",
  "&:hover": {
    color: colors.gray.darker
  }
});

export const recordingRow = css({
  borderBottom: `1px solid ${colors.gray.lightest}`,
  fontSize: 14,
  padding: "15px 0",
  ...mixins.flexSpaceBetween,
  alignItems: "center"
});

export const recordingRowBottom = css({
  color: "#888",
  marginTop: 8,
  span: {
    display: "inline-block",
    margin: "0 8px"
  }
});
