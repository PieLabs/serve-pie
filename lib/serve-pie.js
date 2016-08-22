const express = require('express');
const http = require('http');
const path = require('path');
const usage = require('./cli/usage');
const version = require('./cli/version');

function ServePie(opts) {

  let logger = require('./log-factory').fileLogger(__filename);

  this.run = function (port) {
    
    let initApp = (routers) => {
      let app = require('./server/app')(opts.logHttpRequests, {
        '/' : routers[0],
        '/demo' :routers[1] 
      });
      return Promise.resolve(app);
    };

    let startServer = (app) => {
      return new Promise((resolve, reject) => {
        let server = http.createServer(app);
        server.on('error', reject);
        server.on('listening', () => {
          resolve(server);
        });
        server.listen(port);
      });
    };

    let demoOpts = {
      root: opts.demo || path.join(opts.root, 'docs', 'demo'),
      pies: opts.pie,
      fullInstall: opts.fullInstall
    };

    let mainOpts = {
      root: opts.root,
      demo: '/demo'
    };

    Promise.all([
      require('./server/main')(mainOpts),
      require('./server/demo')(demoOpts)
    ])
    .then(initApp)
    .then(startServer)
    .then((server) => {
      console.log('serve-pie running on port: ' + port);
    })
    .catch((e) => {
      logger.error(e.stack);
      console.error(e);
      process.exit(1);
    });
  };
}

module.exports = (args) => {
  let logFactory = require('./log-factory');
  logFactory.init(args.log);

  if(args.h || args.help){
    console.log(usage);
    process.exit(0);
    return;
  } else if(args.v || args.version){
    let versionInfo = version();
    console.log(`version: ${versionInfo.pkg}, git-sha: ${versionInfo.git || 'n/a'}`);
    return;
  }

  args.root = args.root || process.cwd()

  let servePie = new ServePie(args);
  servePie.run(args.port || process.env.PORT || 5000);
};