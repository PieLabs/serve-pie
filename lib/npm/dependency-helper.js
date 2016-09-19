const semver = require('semver');
const fs = require('fs-extra');
const path = require('path');

exports.isGitUrl = (str) => {
  var re = /(?:git|ssh|https?|git@[\w\.]+):(?:\/\/)?[\w\.@:\/~_-]+\.git(?:\/?|\#[\d\w\.\-/_]+?)$/;
  return re.test(str);
};

exports.isSemver = (str) => semver.valid(str) !== null;

exports.pathIsDir = (root, v) => {
  try {
    let resolved = path.resolve(root, v);
    let stat = fs.lstatSync(resolved);
    return stat.isDirectory();
  } catch (e) {
    return false;
  }
};
