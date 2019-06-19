const withTypescript = require("@zeit/next-typescript");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const withCSS = require("@zeit/next-css");
const webpack = require("webpack");
const withOffline = require("next-offline");

const config = {
  webpack(config, options) {
    if (options.isServer && options.dev)
      config.plugins.push(new ForkTsCheckerWebpackPlugin());

    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.DEV": JSON.stringify(options.dev)
      })
    );

    config.module.rules.unshift({
      test: /\.worker\.ts/,
      use: {
        loader: "worker-loader",
        options: { fallback: true, inline: true }
      }
    });

    config.output.globalObject = `this`;

    return config;
  },

  target: "serverless",

  generateInDevMode: process.env.SW,

  generateSw: false,

  workboxOpts: {
    swDest: "static/service-worker.js",
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "https-calls",
          networkTimeoutSeconds: 15,
          expiration: {
            maxEntries: 150,
            maxAgeSeconds: 30 * 24 * 60 * 60 // 1 month
          },
          cacheableResponse: {
            statuses: [0, 200]
          }
        }
      }
    ]
  }
};

module.exports = withOffline(withCSS(withTypescript(config)));
