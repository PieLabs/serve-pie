'use strict';

const logFactory = require('../log-factory');
const _ = require('lodash');
const fs = require('fs-extra');
const sortBowerDependencies = require('./sort-bower-dependencies');
const overridesProcessor = require('./overrides-processor');

class ResolutionReport {
  constructor(report) {
    this.logger = logFactory.fileLogger(__filename);
    this.report = overridesProcessor.process(report); 
  }
  
  static fromPath(reportPath){
    let obj = fs.readJSONSync(reportPath); 
    return new ResolutionReport(obj);
  }
  
  pieUses(pieName, dependency){
    var bowerNode = this.report[pieName];
    
    if(!bowerNode || !bowerNode.pkgMeta){
      return false;
    } else {
      var dep = bowerNode.pkgMeta.dependencies[dependency];
      return !!dep;
    }
  }
  
  get dependencies() {
    let vals = _.values(this.report);
    let sortResult = sortBowerDependencies.topSortBowerNodes(vals);
    this.logger.debug('sortResult.sorted is array:', _.isArray(sortResult.sorted));
    var sorted = sortResult.sorted.concat(sortResult.unsorted || []);
    return _.map(sorted, 'pkgMeta');
  }
}

module.exports = ResolutionReport;
