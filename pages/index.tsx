import * as React from "react";
import dynamic from "next/dynamic";
import {css} from "emotion";

const Piano = dynamic(import("../components/Piano"));

const x = css({
	padding: 100,
	height: "100vh",
});

export default function () {
	return <div className={x}><Piano /></div>
}
