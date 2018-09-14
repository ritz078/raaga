import * as React from "react";
import Document, { Head, Main, NextScript } from "next/document";
import { extractCritical } from "emotion-server";


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
          <link rel="stylesheet" href={"/static/styles/base.css"} />
          <style dangerouslySetInnerHTML={{ __html: this.props.css }} />
          <script src="https://cdn.polyfill.io/v2/polyfill.js?features=AudioContext,Map,Set,Array.prototype.includes" />
        </Head>
        <body>
            <Main />
            <NextScript />
        </body>
      </html>
    );
  }
}
