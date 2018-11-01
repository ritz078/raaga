import * as React from "react";
import Document, { Main, NextScript, Head } from "next/document";
import { extractCritical } from "emotion-server";
import { injectGlobal } from "emotion";

injectGlobal`
* {
margin: 0;
padding: 0;
box-sizing: border-box;
font-family: "Lato";
}
`;

export default class MyDocument extends Document<{
  css: string;
}> {
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
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Lato"
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
