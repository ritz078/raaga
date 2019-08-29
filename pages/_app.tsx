import App from "next/app";
import React from "react";
import Head from "next/head";

export default class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <>
        <Head>
          <title>Raaga</title>
        </Head>
        <Component {...pageProps} />
      </>
    );
  }
}
