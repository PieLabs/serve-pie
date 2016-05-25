module.exports = function Container() {

  "use strict";

  const logFactory = require('./log-factory');
  const server = require('./server');
  const _ = require('lodash');
  const path = require('path');
  const fs = require('fs-extra');

  let logger = logFactory.fileLogger(__filename);

  function startServer(port, root, itemData, resolutionReport) {
    var App = require('./server');
    var app = new App(root, itemData, resolutionReport);
    var http = require('http');
    app.set('port', port);
    var server = http.createServer(app);
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    function onError(error) {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EADDRINUSE':
          console.error(port + ' is already in use');
          process.exit(1);
          break;
        default:
          throw error;
      }
    }

    function onListening() {
      var addr = server.address();
      console.log('Listening on ' + port);
    }
  }

  function loadItem(rootDir, name) {
    let jsonPath = path.join(rootDir, `${name}.json`);
    let markupPath = path.join(rootDir, `${name}.html`);
    let json = fs.readJsonSync(jsonPath);
    let markup = fs.readFileSync(markupPath, 'utf-8');
    return {json: json, markup: markup};
  }

  let BowerDir = require('./bower/bower-dir');

  function hasName(name) {
    return function (pie) {
      logger.debug('[hasName] name: ', name);
      let bowerPath = path.join(pie, 'bower.json');
      let bowerDef = fs.readJSONSync(bowerPath, { throws: false });
      logger.silly('def:', bowerDef);
      if (!bowerDef) {
        logger.error(`can't load bowerDef for: ${bowerPath}`);
      } else {
        return bowerDef.name === name;
      }
    }
  }

  this.run = function (opts) {

    logger.debug('run', opts);
    let itemData = loadItem(opts.root, 'index');
    let componentNames = _.map(itemData.json.components, 'component.name');
    let bowerDir = new BowerDir(opts.root);
    
    
    //Add the control-panel as a dependency - all the polymer libs need to load from the same path
    //so the control-panel needs to be loaded from this context too.
    opts.pies['control-panel'] = 'git@bitbucket.org:pielibs/control-panel.git';
    let missingDependencies = _.filter(componentNames, (cn) => {
      return opts.pies[cn] === undefined; 
    });
    
    if(missingDependencies.length > 0){
      throw new Error('missing dependency for: ' + missingDependencies);
    }

    logger.debug('[run] dependencies: ', opts.pies);

    if (bowerDir.isInstalled() && !opts.fullInstall) {
      logger.info('already installed - boot the server..');
      startServer(opts.port, opts.root, itemData, bowerDir.resolutionReport());
    } else {
      bowerDir.cleanLocalInstall(opts.pies)
        .then((resolutionReport) => {
          if (!resolutionReport) {
            throw new Error('no resolutionReport');
          }
          startServer(opts.port, opts.root, itemData, resolutionReport);
        })
        .catch((e) => {
          console.error(e.stack);
          throw e;
        });

    }

  };

};
