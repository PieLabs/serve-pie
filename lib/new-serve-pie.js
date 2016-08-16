const express = require('express');
const http = require('http');
const path = require('path');

function ServePie(opts) {

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
  
  function onListening(port) {
    console.log('Listening on ' + port);
  }

  this.run = function (port) {
    let app = require('./server/app')(true);
    app.use('/', require('./server/main')());

    let demoOpts = {
      root: path.join(opts.root, 'docs', 'demo'),
      pies: opts.pie,
      fullInstall: opts.fullInstall

    };

    require('./server/demo')(demoOpts)
      .then((demoRouter) => {
        app.use('/demo', demoRouter); 
        require('./server/error-handler')(app);
        var server = http.createServer(app);
        server.listen(port);
        server.on('error', onError);
        server.on('listening', onListening.bind(null, port));
      })
      .catch((e) => {
        console.log(e);
        logger.error(e);
      })
  };
}

module.exports = (args) => {
  let logFactory = require('./log-factory');
  logFactory.init(args.log);

  args.root = args.root || process.cwd()

  let servePie = new ServePie(args);
  servePie.run(args.port || process.env.PORT || 5000);
};