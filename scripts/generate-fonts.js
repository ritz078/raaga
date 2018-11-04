const webFontsGenerator = require("webfonts-generator");
const globby = require("globby");
const path = require("path");

const svgDir = path.resolve(__dirname, "../assets/svgs");

(async function() {
  const paths = await globby([svgDir, "!**/*/*.tsx"]);

  webFontsGenerator({
    files: paths,
    dest: path.resolve(__dirname, "../static/fonts"),
    fontName: "synth"
  });
})();
