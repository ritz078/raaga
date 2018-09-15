import { css } from "emotion";
import {mixins} from "@anarock/pebble";

export const popperClass = css({
  zIndex: 9,
  boxShadow: "0px 7px 25px 11px rgba(0,0,0,0.1)",
  "& > div": {
    maxHeight: "80vh"
  }
});

export const settingsWrapper = css({
  backgroundColor: "#2d2d2d",
  height: 50,
  borderRadius: "4px 4px 0 0",
  alignItems: "center",
  padding: "0 26px",
	...mixins.flexSpaceBetween,
	position: "absolute",
	width: "100%",
	marginTop: -50,
	transition: "transform 200ms",
	"&.__visible__": {
  	transform: "translateY(-50px)"
	}
});

export const labelClass = css({
  color: "white",
  cursor: "pointer",
  fontSize: 14,
  "&:hover": {
    textDecoration: "underline"
  }
});
