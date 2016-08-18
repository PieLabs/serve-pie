
const mimeTypes = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif'
};

module.exports = (res, ext, streamPromise) => {

  let logger = require('../../../log-factory').fileLogger(__filename);
  
  streamPromise
    .then((s) => {
      logger.debug(`[serveStream] ${ext}`);
      var mimeType = mimeTypes[ext];
      res.header('Content-Type', mimeType);
      res.writeHead(200);
      s.pipe(res);
    })
    .catch((e) => {
      logger.error(`[/:pie/*] err: ${e}`);
      logger.error(e.stack);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.write(`404 Not Found: \n${e}\n`);
      res.end();
    });
};