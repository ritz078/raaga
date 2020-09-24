import App from "next/app";
import React from "react";
import Head from "next/head";
import "@styles/index.css";
import NProgress from "nprogress";

if (IN_BROWSER) {
  require("intersection-observer");
  require("audio-context-polyfill");
  // client-side-only code
}

NProgress.configure({ showSpinner: false });

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <Head>
          <title>Raaga | See &middot; Play &middot; Learn</title>
          <meta
            name="description"
            content="A platform to play and learn piano with your own pace."
          />
          <script async src="https://unpkg.com/thesemetrics@latest"/>
        </Head>
        <Component {...pageProps} />
      </>
    );
  }
}
