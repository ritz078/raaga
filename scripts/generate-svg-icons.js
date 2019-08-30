const svgStore = require("svgstore");
const path = require("path");
const globby = require("globby");
const fileName = require("file-name");
const fs = require("fs");

const svgDir = path.resolve(__dirname, "../assets/icons");

(async function() {
  const paths = await globby([svgDir, "!**/*/*.tsx"]);

  const sprites = svgStore();

  paths.forEach(_path => {
    sprites.add(fileName(_path), fs.readFileSync(_path, "utf8"));
  });

  fs.writeFileSync("./assets/icons.svg", sprites);
})();
