const { Midi } = require("@tonejs/midi");
const fs = require("fs");
const path = require("path");

fs.readdir(path.resolve(__dirname, "../public/static/midi"), (err, files) => {
  const meta = [];
  files.forEach(file => {
    const data = fs.readFileSync(
      path.resolve(__dirname, "../public/static/midi", file)
    );
    const { header, duration, tracks } = new Midi(data);
    meta.push({
      url: `/static/midi/${file}`,
      label: header.name || file.replace(".mid", ""),
      duration,
      tracks: tracks.length
    });
  });

  fs.writeFile(
    path.resolve(__dirname, "../midi.json"),
    JSON.stringify(meta, null, 2),
    () => {}
  );
});
