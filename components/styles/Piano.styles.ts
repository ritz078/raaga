import { colors } from "@anarock/pebble";
import { HORIZONTAL_GAP_BETWEEN_NOTES, PIANO_HEIGHT } from "@config/piano";

export const keys = {
  display: "flex",
  transition: "all 200ms",
  userSelect: "none"
};

export const accidentalKeys = {
  height: "7em",
  zIndex: 1,
  border: `${HORIZONTAL_GAP_BETWEEN_NOTES / 2}px solid #000`,
  borderRadius: "0 0 3px 3px",
  boxShadow:
    "-1px -1px 2px rgba(255, 255, 255, 0.2) inset,0 -5px 2px 3px rgba(0, 0, 0, 0.6) inset, 0 2px 4px rgba(0, 0, 0, 0.5)",
  background: "#333",
  position: "absolute",
  top: 0,
  cursor: "pointer",
  "&.__active__": {
    height: "6.8em",
    backgroundImage: "linear-gradient(#FBD95C, #FBCF32)",
    borderColor: "#b49b45",
    boxShadow:
      "-1px -1px 2px rgba(255, 255, 255, 0.2) inset,0 -5px 2px 3px rgba(0, 0, 0, 0.2) inset, 0 2px 4px rgba(0, 0, 0, 0.2)"
  }
};

export const naturalKeys = {
  height: PIANO_HEIGHT,
  zIndex: 0,
  border: `${HORIZONTAL_GAP_BETWEEN_NOTES / 2}px solid #4a4a4a`,
  borderTopWidth: 0,
  borderRadius: "0 0 5px 5px",
  backgroundColor: "#fff",
  flex: 1,
  width: "auto !important",
  cursor: "pointer",
  borderBottom: "4px solid #90caf9",
  "&.__active__": {
    height: PIANO_HEIGHT - 5,
    backgroundImage: "linear-gradient(#42C9FF, #28E6FF)",
    borderBottomColor: "#42C9FF"
  }
};

export const labelStyle = {
  textTransform: "uppercase",
  display: "flex",
  justifyContent: "center",
  alignSelf: "flex-end",
  width: "100%",
  paddingBottom: 15,
  color: colors.gray.dark,
  userSelect: "none",
  fontSize: 12
};
