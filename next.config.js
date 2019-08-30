const withCSS = require("@zeit/next-css");
const webpack = require("webpack");

const config = {
  webpack(config, options) {
    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.DEV": JSON.stringify(options.dev),
        IN_BROWSER: !options.isServer,
        IS_DEV: options.dev
      })
    );

    config.module.rules.unshift(
      {
        test: /\.worker\.ts/,
        use: {
          loader: "worker-loader",
          options: { fallback: true, inline: true }
        }
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              svgoConfig: {
                plugins: {
                  removeViewBox: false
                }
              }
            }
          },
          {
            loader: "url-loader"
          }
        ]
      }
    );

    config.output.globalObject = 'typeof self !== "object" ? self : this';

    // Temporary fix for https://github.com/zeit/next.js/issues/8071
    config.plugins.forEach(plugin => {
      if (plugin.definitions && plugin.definitions["typeof window"]) {
        delete plugin.definitions["typeof window"];
      }
    });

    return config;
  },

  target: "serverless"
};

module.exports = withCSS(config);
