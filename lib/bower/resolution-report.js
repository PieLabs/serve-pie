"use strict";

const logFactory = require('../log-factory');
const _ = require('lodash');
const fs = require('fs-extra');
const sortBowerDependencies = require('./sort-bower-dependencies');

class ResolutionReport {
  constructor(report) {
    this.logger = logFactory.fileLogger(__filename);
    this.report = report; 
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
  };
  
  get dependencies() {
    let vals = _.values(this.report);
    let sorted = sortBowerDependencies.topSortBowerNodes(vals);
    return _.map(sorted, 'pkgMeta');
  };
}

module.exports = ResolutionReport;
