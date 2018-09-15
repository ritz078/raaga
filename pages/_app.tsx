import App, { Container } from "next/app";
import React from "react";
import withReduxStore from "../store";
import { Provider } from "react-redux";
import { Store } from "redux";

interface AppProps {
  reduxStore: Store;
}

class MyApp extends App<AppProps> {
  render() {
    const { Component, pageProps, reduxStore } = this.props;
    return (
      <Container>
        <Provider store={reduxStore}>
          <Component {...pageProps} />
        </Provider>
      </Container>
    );
  }
}

export default withReduxStore(MyApp);
