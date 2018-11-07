import App, { Container } from "next/app";
import React from "react";
import withReduxStore from "../store";
import { Provider } from "react-redux";
import { Store as S } from "redux";
import Head from "next/head";
import { Store } from "@typings/store";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

interface AppProps {
  reduxStore: S<Store>;
}

class MyApp extends App<AppProps> {
  render() {
    const { Component, pageProps, reduxStore } = this.props;
    const persistor = persistStore(reduxStore);
    return (
      <>
        <Head>
          <title>Piano</title>
        </Head>
        <Container>
          <Provider store={reduxStore}>
            <PersistGate loading={null} persistor={persistor}>
              <Component {...pageProps} />
            </PersistGate>
          </Provider>
        </Container>
      </>
    );
  }
}

export default withReduxStore(MyApp);
