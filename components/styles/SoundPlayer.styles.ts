import { css } from "emotion";
import {colors} from "@anarock/pebble";

export const loaderClass = css({
  position: "absolute",
  zIndex: 10
});

export const pianoWrapperClass = css({
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
});

export const piano = css({
  display: "flex",
  flex: 1,
  transition: "all 200ms",
  position: "relative",
  ".ReactPiano__Key": {
    display: "flex",
    transition: "all 200ms"
  },
  ".ReactPiano__Key--natural": {
    height: "16em",
    zIndex: 0,
    border: "1px solid #4a4a4a",
    borderTopWidth: 0,
    borderRadius: "0 0 5px 5px",
    backgroundColor: "#fff",
    flex: 1,
		width: "auto !important",
    cursor: "pointer",
    borderBottom: "4px solid #90caf9",
    "&:last-child": {
      marginRight: 0
    },
    "&.ReactPiano__Key--active": {
      height: "15.5em",
      backgroundImage: "linear-gradient(#42C9FF, #28E6FF)",
      borderBottomColor: "#42C9FF",
			".ReactPiano__NoteLabelContainer": {
				color: colors.gray.dark
			}
    }
  },
  ".ReactPiano__Key--accidental": {
    height: "8em",
    zIndex: 1,
    border: "1px solid #000",
    borderRadius: "0 0 3px 3px",
    boxShadow:
      "-1px -1px 2px rgba(255, 255, 255, 0.2) inset,0 -5px 2px 3px rgba(0, 0, 0, 0.6) inset, 0 2px 4px rgba(0, 0, 0, 0.5)",
    background: "#333",
    position: "absolute",
    top: 0,
    cursor: "pointer",
    "&.ReactPiano__Key--active": {
      height: "7.9em",
      backgroundImage: "linear-gradient(#FBD95C, #FBCF32)",
      borderColor: "#b49b45",
      boxShadow:
        "-1px -1px 2px rgba(255, 255, 255, 0.2) inset,0 -5px 2px 3px rgba(0, 0, 0, 0.2) inset, 0 2px 4px rgba(0, 0, 0, 0.2)",
			".ReactPiano__NoteLabelContainer": {
      	color: colors.gray.dark
			}
    }
  },
  ".ReactPiano__NoteLabelContainer": {
    textTransform: "uppercase",
    display: "flex",
    justifyContent: "center",
    alignSelf: "flex-end",
    width: "100%",
    paddingBottom: 15,
		color: colors.gray.base,
		userSelect: "none",
		fontSize: 10
  }
});


