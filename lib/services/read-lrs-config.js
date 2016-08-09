const minimist = require('minimist');

module.exports = function(argv){
  const args = minimist(argv);
  let out = {};
  out.endpoint = args['lrs-endpoint'];
  out.user = args['lrs-user'];
  out.password = args['lrs-password'];
  out.email = args['lrs-email'];
  return out;
}