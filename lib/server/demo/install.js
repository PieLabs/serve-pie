const ItemData = require('../../item-data');
const BowerDir = require('../../bower/bower-dir');
const _ = require('lodash');

exports.bower = (bowerDir) => {

  let logger = require('../../log-factory').fileLogger(__filename);

  logger.debug(`componentNames: ${componentNames}`);

  let missingDependencies = _.filter(componentNames, (cn) => {
    return opts.pies[cn] === undefined;
  });

  if (missingDependencies.length > 0) {
    throw new Error('missing dependency for: ' + JSON.stringify(missingDependencies));
  }

  logger.debug('[run] dependencies: ', opts.pies);

  if (bowerDir.isInstalled() && !opts.fullInstall) {
    logger.info('already installed - boot the server..');
    logger.debug(`pies: ${opts.pies}`);
    return readPieProcessors(opts.pies, bowerDir.components())
  } else {

    //Add the control-panel as a dependency - all the polymer libs need to load from the same path
    //so the control-panel needs to be loaded from this context too.
    let extraComponents = {};
    extraComponents['control-panel'] = 'git@bitbucket.org:pielibs/control-panel.git';
    extraComponents.masking = 'git@bitbucket.org:pielibs/masking.git';
    extraComponents['popup-glossary'] = 'git@bitbucket.org:pielibs/popup-glossary.git';
    extraComponents.highlighter = 'git@bitbucket.org:pielibs/highlighter.git';

    return bowerDir.cleanLocalInstallLink(_.extend({}, opts.pies, extraComponents), opts.resolutions)
      .then((resolutionReport) => {
        if (!resolutionReport) {
          throw new Error('no resolutionReport');
        }
        return readPieProcessors(opts.pies, bowerDir.components());
      });
  }

};