import * as React from "react";
import dynamic from "next/dynamic";
import { css } from "emotion";

// @ts-ignore
const Piano = dynamic(import("@components/Piano"));

const main = css({
  height: "100vh",
	flexDirection: "column",
  display: "flex",
  width: "100%",
	backgroundColor: "#e91e63"
});

export default function() {
  return (
    <div className={main}>
			<div style={{
				backgroundColor: "#000",
				height: "50vh",
			}} />
			<div style={{
				padding: "0 100px"
			}}>
				<Piano />

			</div>
    </div>
  );
}
