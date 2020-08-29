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
          <link rel="manifest" href="/manifest.webmanifest"/>
          <link
            rel="shortcut icon"
            type="image/png"
            href="/static/images/favicon.png"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
