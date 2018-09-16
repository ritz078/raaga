import { css } from "emotion";
import { mixins } from "@anarock/pebble";

export const trackRow = css({
  ...mixins.flexSpaceBetween,
  padding: "15px 20px",
  borderBottom: "1px solid #292929",
  textTransform: "capitalize",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#2a2a2a"
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
