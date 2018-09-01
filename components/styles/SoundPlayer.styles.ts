import { css } from "emotion";

export const popperClass = css({
  zIndex: 9
});

export const settingsWrapper = css({
  backgroundColor: "#2d2d2d",
  height: 50,
  marginTop: -50,
  borderRadius: "20px 20px 0 0",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "0 26px"
});

export const labelClass = css({
  color: "white",
  cursor: "pointer",
  fontSize: 14,
	"&:hover": {
  	textDecoration: "underline"
	}
});
