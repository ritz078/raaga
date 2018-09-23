import * as React from "react";
import Document, { Head, Main, NextScript } from "next/document";
import { extractCritical } from "emotion-server";
import { injectGlobal } from "emotion";

injectGlobal`
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
	font-family: "Lato", sans-serif;
	-webkit-font-smoothing: antialiased;
}

body {
	overflow-x: hidden;
}
`;

export default class MyDocument extends Document {
  static getInitialProps({ renderPage }) {
    const page = renderPage();
    const styles = extractCritical(page.html);
    return { ...page, ...styles };
  }

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
          <title>With Emotion</title>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Lato"
          />
          <link
            rel="stylesheet"
            href="https://i.icomoon.io/public/temp/91881e62dd/UntitledProject1/style.css"
          />
          <style dangerouslySetInnerHTML={{ __html: this.props.css }} />
          <script src="https://cdn.polyfill.io/v2/polyfill.js?features=AudioContext,Map,Set,Array.prototype.includes,fetch" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
