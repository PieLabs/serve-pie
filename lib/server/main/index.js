const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const jsesc = require('jsesc');

module.exports = (opts) => {

  let logger = require('../../log-factory').fileLogger(__filename);

  let loadReadme = () => {
    let readmePath = path.join(opts.root, 'README.md');
    let lstat = fs.lstatSync(readmePath);

    if(lstat.isFile()){
      try{ 
        return fs.readFileSync(readmePath, 'utf8');
      } catch(e){
        logger.warn(`Error reading readme in path: ${readmePath}, ${e}`);
        return ''
      }
    } else {
      logger.warn(`Cant find README.md in path: ${readmePath}`);
      return '';
    }
  };

  let router = express.Router();

  logger.info('init router...');

  let readme = loadReadme();
  //let bower = fs.readJSONSync(path.join(opts.root, 'bower.json'));
  let schemas = require('./schema-loader')(path.join(opts.root, 'docs', 'schema'));
  let bower = {
    name: 'tmp',
    version: 'tmp',
    repository: 'tmp'
  }
  
  router.use('/components', express.static(path.join(__dirname, 'components')));
  
  router.use(express.static(path.join(__dirname, 'public')));

  router.get('/', (req, res, next) => {
    res.render('main/index', {
      name: bower.name,
      version: bower.version,
      repositoryUrl: bower.repository,
      demo: opts.demo,
      readme: jsesc(readme),
      schemas: schemas, 
      pie: {
        url: 'http://github.com/PieLabs/pie',
        logo: '/svg/pie.svg'
      }
    });
  });
  
  return Promise.resolve(router);
}