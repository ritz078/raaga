// postcss.config.js
const purgecss = [
  "@fullhuman/postcss-purgecss",
  {
    // Specify the paths to all of the template files in your project
    content: ["./src/pages/**/*.tsx", "./src/components/**/*.tsx"],

    // Include any special characters you're using in this regular expression
    defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
    whitelistPatternsChildren: [/nprogress$/]
  }
];

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  plugins: [
    "postcss-easy-import",
    "tailwindcss",
    "postcss-custom-properties",
    "autoprefixer",
    ...(isProduction ? [purgecss] : [])
  ]
};
