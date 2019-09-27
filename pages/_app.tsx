import App from "next/app";
import React from "react";
import Head from "next/head";
import "@styles/index.css";
import NProgress from "nprogress";

NProgress.configure({ showSpinner: false });

let reactGa;
if (IN_BROWSER && !IS_DEV) {
  reactGa = require("react-ga");
  reactGa.initialize("UA-60624235-9");
}

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
        </Head>
        <Component {...pageProps} />
      </>
    );
  }
}
