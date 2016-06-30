const _ = require('lodash');
const fs = require('fs-extra');
const path = require('path');
const Override = require('./override');

/**
 * Updates the pkgMeta.main property for dependencies.
 * The source for the update is in each dependency's bower.json in overrides.$dependencyName.main. 
 * For now we just add to the main field if the value is new.
 */
let process = (report) => {

  /**
   * @param - the main report
   * @param updates a map of dependency name -> an array of Override definitions.
   * eg: { dep-a: [ 'a.js', ['a.js'], {swap: {'a.js', 'b.js'}}, ...], dep-b: []}
   */
  let updateReport = (report, updates) => {

    let out = _.reduce(updates, (acc, value, key) => {
      let srcNode = acc[key];

      if (srcNode) {
        srcNode.pkgMeta = _.reduce(value, (acc, overrideValue) => {
          let srcMain = _.flatten([acc.main]);
          let o = Override.fromMain(overrideValue);
          acc.main = o.apply(srcMain);
          return acc;
        }, srcNode.pkgMeta);
      }
      return acc;
    }, report);

    return out;
  };

  let overrideNodes = _.mapValues(report, (v) => {

    if(!v || !v.canonicalDir){
      return {};
    }

    let componentPath = v.canonicalDir;
    let bowerFilepath = path.join(componentPath, 'bower.json');

    let bowerDef;
    let bowerFileExists = () => {
      try { 
        return fs.statSync(bowerFilepath).isFile();
      } catch (e){
        return false;
      }
    }; 

    if(bowerFileExists()){
      bowerDef = fs.readJsonSync(bowerFilepath, { throws: false });
    }

    if (bowerDef && bowerDef.overrides) {
      return bowerDef.overrides;
    } else {
      return {};
    }
  });

  let merged = _(overrideNodes).values().reduce((acc, v) => {
    return _.reduce(v, (acc, nodeValue, nodeName) => {
      acc[nodeName] = acc[nodeName] || [];
      acc[nodeName].push(nodeValue.main);
      return acc;
    }, acc);
  }, {});

  let updated = updateReport(_.cloneDeep(report), merged);
  return updated;
};

exports.process = process;