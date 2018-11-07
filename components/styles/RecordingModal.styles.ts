import { css } from "emotion";
import { colors } from "@anarock/pebble";

export const iconClose = css({
  position: "absolute",
  right: 25,
  top: 25,
  cursor: "pointer",
  "&:hover": {
    color: colors.gray.darker
  }
});

export const title = css({ marginBottom: 30 });

export const description = css({
  fontSize: 14,
  lineHeight: "21px",
  color: colors.gray.darker,
  marginBottom: 20,
  display: "inline-block"
});
