import { css } from "emotion";

const BORDER_COLOR = "#2a2a2a";

export const dialogWrapper = css({
  width: 990,
  paddingLeft: 10
});

export const header = css({
  marginBottom: 20,
  borderBottom: `1px solid ${BORDER_COLOR}`,
  padding: "10px 0"
});

export const footer = css({
  display: "flex",
  flexDirection: "row",
  borderTop: `1px solid ${BORDER_COLOR}`,
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 10,
  paddingTop: 10
});

export const playButton = css({
  display: "inline-flex",
  backgroundColor: "#fff",
  padding: "8px 10px",
  borderRadius: 2,
  marginRight: 10,
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
  marginTop: 3
});
