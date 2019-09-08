import * as React from "react";
import Document, { Main, NextScript, Head } from "next/document";

export default class MyDocument extends Document<{}> {
  constructor(props) {
    super(props);
    const { __NEXT_DATA__, ids } = props;
    if (ids) {
      __NEXT_DATA__.ids = ids;
    }
  }

  render() {
    return (
      <html>
        <Head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Voces"
          />
          <link
            rel="shortcut icon"
            type="image/png"
            href="/static/images/favicon.png"
          />
          <script src="https://cdn.polyfill.io/v2/polyfill.js?features=AudioContext,Map,Set,Array.prototype.includes,fetch,IntersectionObserver" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
