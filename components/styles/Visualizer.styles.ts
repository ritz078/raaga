import { css } from "emotion";
import { colors } from "@anarock/pebble";

export const visualizerWrapper = css({
  display: "flex",
  flexDirection: "row",
  position: "relative",
  flex: 1,
  overflow: "hidden"
});

export const noteSectionWrapper = css({
  color: colors.white.base,
  flex: 1,
  position: "absolute",
  display: "flex",
  flexDirection: "row",
  left: 0,
  right: 0,
  bottom: 0,
  top: 0
});

export const noteSection = css({
  flex: 1,
	"&:nth-of-type(4n)": {
		border: `1px solid rgba(255,255,255,0.07)`,
		borderTopWidth: 0,
		borderBottomWidth: 0,
	}
});
