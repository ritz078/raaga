import { css } from "emotion";
import { colors, mixins } from "@anarock/pebble";

export const trackRow = css({
  ...mixins.flexSpaceBetween,
  padding: "15px 20px",
  borderBottom: "1px solid #292929",
  textTransform: "capitalize",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#2a2a2a"
  },
  "&.__disabled__": {
    pointerEvents: "none",
    cursor: "not-allowed",
    opacity: 0.6
  }
});

export const trackSelectionModal = css({
  maxHeight: 500,
  width: 600,
  backgroundColor: "#333",
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  top: 70,
  borderRadius: 4,
  zIndex: 99,
  color: "#dadada",
  fontSize: 13,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column"
});

export const modalTop = css({
  height: 100,
  backgroundColor: "#090a0c7a",
  padding: 20,
  color: "#fff",
  paddingTop: 55
});

export const modalBottom = css({
  flex: 1,
  overflow: "auto",
  "& .__name__": {
    flex: 1,
    ...mixins.textEllipsis,
    paddingRight: 30
  },
  "& .__play__": {
    fontSize: 14
  }
});

export const headerClass = css({
  height: 80,
  position: "absolute",
  width: "100%",
  background: `linear-gradient(to bottom, #000 0%, rgba(0,0,0,0) 100%)`,
  zIndex: 9,
  ...mixins.flexSpaceBetween,
  alignItems: "center",
  padding: "0 30px",
  i: {
    cursor: "pointer",
    padding: "28px 20px",
    color: "#e7e7e7",
    fontSize: 20,
    transition: "all 200ms",
    "&:hover": {
      color: colors.white.base
    }
  }
});

export const headerRight = css({
  ...mixins.flexSpaceBetween,
  svg: {
    margin: 15,
    cursor: "pointer",
    fill: colors.white.base
  }
});

export const playPause = css({
  ...mixins.flexSpaceBetween,
  width: 300,
  ...mixins.flexMiddleAlign,
  padding: "10px 20px",
  borderRadius: 4,
  backgroundColor: "rgba(37, 37, 37, 0.83)"
});
