const _ = require('lodash');

module.exports = (pies) => {
  let arr = _.isArray(pies) ? pies : [pies];
  return _(arr).compact().reduce((acc, p) => {
    try {
      let resolved = path.resolve(p);
      let stat = require('fs-extra').lstatSync(resolved);
      console.log('resolved: ', resolved);
      if (stat.isDirectory()) {
        let name = path.basename(resolved);
        acc[name] = resolved;
      }
    } catch (e) {
      logger.error(`Can't find path: ${p}`);
      logger.debug(e.stack);
    }
    return acc;
  }, {})
};