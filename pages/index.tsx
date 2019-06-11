import * as React from "react";
import dynamic from "next/dynamic";
import {
  betaTag,
  bodyClass,
  mainHeader,
  playerWrapper
} from "./styles/main.styles";
import { headerLogo } from "@components/styles/Header.styles";
import Icon from "@components/Icon";
import { colors } from "@anarock/pebble";

const SoundPlayer = dynamic((() => import("@components/SoundPlayer")) as any, {
  ssr: false
});

export default function() {
  return (
    <div className={bodyClass}>
      <header className={mainHeader}>
        <span className={headerLogo}>
          🎹
          <span className={betaTag}>beta</span>
        </span>

        <a target="_blank" href="https://github.com/ritz078/raaga">
          <Icon name="github" color={colors.white.base} size={23} />
        </a>
      </header>
      <div className={playerWrapper}>
        <SoundPlayer />
      </div>
    </div>
  );
}
