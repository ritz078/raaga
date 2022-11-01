// postcss.config.js
const purgecss = require("@fullhuman/postcss-purgecss")({
  content: ["./src/pages/**/*.tsx", "./src/components/**/*.tsx"],

  // Include any special characters you're using in this regular expression
  defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
  whitelistPatternsChildren: [/nprogress$/]
});

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  plugins: [
    require("postcss-easy-import"),
    require("tailwindcss"),
    require("postcss-custom-properties"),
    require("autoprefixer"),
    ...(isProduction ? [purgecss] : [])
  ]
};
