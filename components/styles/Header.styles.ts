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
  backgroundColor: "#333",
  color: "#dadada",
  fontSize: 13,
  display: "flex",
  flexDirection: "column",
  borderRadius: 4
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
  ".icon-padding": {
    cursor: "pointer",
    padding: "28px 20px",
    color: "#e7e7e7",
    fontSize: 20,
    width: 50,
    height: 50,
    transition: "all 200ms",
    "&:hover": {
      color: colors.white.base
    }
  }
});

export const headerRight = css({
  ...mixins.flexSpaceBetween,
  alignItems: "center",
  svg: {
    padding: 15,
    width: 50,
    height: 50,
    cursor: "pointer",
    fill: colors.white.base
  }
});

export const iconClass = css({
  margin: 15,
  cursor: "pointer",
  fill: colors.white.base
});

export const instrumentLabel = css({
  display: "block",
  color: colors.white.base,
  backgroundColor: "rgba(47,47,47,0.8)",
  padding: "12px 20px",
  borderRadius: 4,
  fontSize: 13,
  cursor: "pointer",
  marginLeft: 20,
  marginRight: 10,
  span: {
    fontSize: 8,
    marginLeft: 8,
    transition: "transform 200ms",
    display: "inline-block",
    "&.__open__": {
      transform: "rotate(180deg)"
    }
  }
});

export const recordBtn = css({
  color: colors.red.base,
  fontSize: 13,
  backgroundColor: colors.white.base,
  height: 40,
  padding: "0 15px",
  borderRadius: 20,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  margin: "0 20px",
  cursor: "pointer",
  outline: 0,
  border: 0
});

export const headerLogo = css({
  fontSize: 24,
  display: "inline-flex",
  marginRight: 30,
  alignItems: "center"
});

export const iconNotifier = css({
  backgroundColor: colors.red.base,
  color: colors.white.base,
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: 10,
  borderRadius: 10,
  width: 20,
  height: 20,
  position: "absolute",
  top: "14px",
  transform: "translateX(27px)"
});
