const path = require('path');
const fs = require('fs-extra');

module.exports = () => {

  let projectRoot = path.resolve(__dirname, '..', '..');
  const execSync = require('child_process').execSync;

  let pkg = fs.readJSONSync(path.join(projectRoot, 'package.json'));
  let pkgVersion = pkg.version;
  let gitDir = path.join(projectRoot, '.git');

  if (fs.existsSync(gitDir)) {
    let result = execSync(`git --git-dir=${gitDir} --work-tree=${projectRoot} rev-parse --short HEAD`, { encoding: 'utf8' });
    return { pkg: pkgVersion, git: result.trim() };
  } else {
    return { pkg: pgkVersion, git: null };
  }
};