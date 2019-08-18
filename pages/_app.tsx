import App, { Container } from "next/app";
import React from "react";
import withReduxStore from "../store";
import { Provider } from "react-redux";
import { Store as S } from "redux";
import Head from "next/head";
import { Store } from "@typings/store";

interface AppProps {
  reduxStore: S<Store>;
}

class MyApp extends App<AppProps> {
  render() {
    const { Component, pageProps, reduxStore } = this.props;
    return (
      <>
        <Head>
          <title>Piano</title>
        </Head>
        <Container>
          <Provider store={reduxStore}>
            <Component {...pageProps} />
          </Provider>
        </Container>
      </>
    );
  }
}

export default withReduxStore(MyApp);
