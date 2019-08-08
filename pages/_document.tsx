import * as React from "react";
import Document, { Main, NextScript, Head } from "next/document";
import { extractCritical } from "emotion-server";
import { injectGlobal } from "emotion";

injectGlobal`
* {
margin: 0;
padding: 0;
box-sizing: border-box;
font-family: "Viga";
-webkit-font-smoothing: antialiased;
}

.ReactModal__Overlay {
    opacity: 0;
    transform: translateY(10px);
    transition: all 500ms ease-in-out;
}

.ReactModal__Overlay--after-open{
    opacity: 1;
    transform: translateY(0);
}

.ReactModal__Overlay--before-close{
    opacity: 0;
    transform: translateY(10px);
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
            href="https://fonts.googleapis.com/css?family=Viga"
          />
          <link rel="stylesheet" href={"/static/fonts/synth.css"} />
          <link
            rel="stylesheet"
            href="https://unpkg.com/@anarock/pebble/dist/pebble.css"
          />
          <style dangerouslySetInnerHTML={{ __html: this.props.css }} />
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
