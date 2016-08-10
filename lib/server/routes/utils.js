const url = require('url');

exports.urlFromReferer = (req) => {
  let hostAndPort = req.headers['Referer'] || req.headers['host'];
  let split = hostAndPort.split(':');
  let port = split.length === 2 ? split[1] : null;
  port = port === 80 || port === 443 ? null : port;
  let host = split[0];

  return url.format({
      protocol: req.protocol,
      port: port,
      hostname: host,
    });
};

