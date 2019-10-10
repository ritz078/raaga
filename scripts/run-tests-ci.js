const { exec } = require("child_process");
const { promisify } = require("util");
const _exec = promisify(exec);
const { kebabCase } = require("lodash");

async function getBranchName() {
  const { stdout } = await _exec("git branch | grep \\* | cut -d ' ' -f2");
  return stdout.trim();
}

async function getUrl() {
  const branchName = await getBranchName();
  return branchName === `https://synth-git-${kebabCase(branchName)}.now.sh`;
}

(async function() {
  const url = await getUrl();
  await _exec(`DEPLOYEMENT_URL=${url} cypress run --record`);
})();
