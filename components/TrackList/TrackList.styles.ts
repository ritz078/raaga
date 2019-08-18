import { css } from "emotion";

const BORDER_COLOR = "#2a2a2a";

export const dialogWrapper = css({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  overflow: "hidden"
});

export const header = css({
  borderBottom: `1px solid ${BORDER_COLOR}`,
  padding: "20px 15px 10px 20px",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center"
});

export const footer = css({
  display: "flex",
  flexDirection: "row",
  borderTop: `1px solid ${BORDER_COLOR}`,
  justifyContent: "space-between",
  alignItems: "center",
  height: 50,
  padding: 20
});

export const playButton = css({
  display: "inline-flex",
  backgroundColor: "#fff",
  padding: "8px 10px",
  borderRadius: 2,
  fontSize: 12,
  cursor: "pointer",
  "&.__disabled__": {
    opacity: 0.5,
    pointerEvents: "none"
  }
});

export const sectionTitle = css({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  margin: "20px 0"
});

export const instrumentWrapper = css({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap"
});

export const titleSubText = css({
  marginTop: 2
});

export const content = css({
  display: "flex",
  flex: 1,
  overflowY: "scroll",
  flexDirection: "column",
  backgroundColor: "#1b1b1b",
  padding: "0 15px 20px 20px"
});

export const sidebar = css({
  width: 250,
  backgroundColor: "#272727",
  borderTopLeftRadius: 10,
  borderBottomLeftRadius: 10,
  padding: 20
});

export const zeroStateWrapper = css({
  minHeight: 500,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
});

export const zeroStateIllustration = css({
  width: 550,
  color: "#7b7b7b",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
});

export const trackList = css({
  display: "flex",
  flexDirection: "row",
  flex: 1
});

export const sample = css({
  fontSize: 14,
  textTransform: "capitalize",
  padding: "2px 0",
  color: "#909090",
  textOverflow: "ellipsis",
  overflow: "hidden",
  whiteSpace: "nowrap",
  cursor: "pointer",
  "&:hover": {
    color: "#fff"
  }
});

export const sampleTitle = css({
  fontSize: 15,
  color: "#fff",
  padding: "15px 0 5px"
});
