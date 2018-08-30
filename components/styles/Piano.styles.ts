import {css, injectGlobal} from "emotion";

injectGlobal`
* {
	margin: 0;
	box-sizing: border-box;
}
`

export const pianoWrapperStyle = css({
	".ReactPiano__Keyboard": {
		position: "relative",
		display: "flex",
	},
	".ReactPiano__Key": {
		display: "flex",
		transition: "all 200ms"
	},
	".ReactPiano__Key--natural": {
		height: "16em",
		zIndex: 0,
		borderLeft: "1px solid #bbb",
		borderBottom: "1px solid #bbb",
		borderRadius: "0 0 5px 5px",
		boxShadow:
			"-1px 0 0 rgba(255, 255, 255, 0.8) inset, 0 0 5px #ccc inset,0 0 3px rgba(0, 0, 0, 0.2)",
		backgroundColor: "#fff",
		flex: 1,
		marginRight: 1,
		cursor: "pointer",
		"&:last-child": {
			marginRight: 0
		},
		"&.ReactPiano__Key--active": {
			height: "15.5em",
			backgroundColor: "#e0e0e0"
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
		"&.ReactPiano__Key--active": {
			height: "7.8em",
			backgroundColor: "#000"
		}
	},
	".ReactPiano__NoteLabelContainer": {
		display: "none"
	}
});
