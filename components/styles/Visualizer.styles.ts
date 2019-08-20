export const visualizerWrapper = {
  display: "flex",
  flexDirection: "row",
  position: "relative",
  flex: 1,
  overflow: "hidden"
};

export const noteSectionWrapper = {
  color: "#fff",
  flex: 1,
  position: "absolute",
  display: "flex",
  flexDirection: "row",
  left: 0,
  right: 0,
  bottom: 0,
  top: 0
};

export const noteSection = {
  flex: 1,
  "&:nth-of-type(4n)": {
    border: `1px solid rgba(255,255,255,0.07)`,
    borderTopWidth: 0,
    borderBottomWidth: 0
  }
};
