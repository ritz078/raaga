const withTypescript = require("@zeit/next-typescript");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const withCSS = require("@zeit/next-css");

module.exports = withCSS(
  withTypescript({
    webpack(config, options) {
      if (options.isServer && options.dev)
        config.plugins.push(new ForkTsCheckerWebpackPlugin());

      config.module.rules.unshift({
        test: /\.worker\.ts/,
        use: { loader: "worker-loader", options: { fallback: true } }
      });

      return config;
    }
  })
);
