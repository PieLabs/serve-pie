/**
 * Sorts dependencies listed in a bower installation report
 */
"use strict";

const _ = require('lodash');
const logFactory = require('../log-factory');
const logger = logFactory.fileLogger(__filename);

class StrippedNode {
  constructor(n) {
    this.n = n;
    this.s = {
      pkgMeta: {
        name: n.pkgMeta.name,
        version: n.pkgMeta.version
      },
      dependencies: _.keys(n.dependencies)
    };
  };
  toString() {
    return JSON.stringify(this.s, null, '  ');
  }
}

class SortError extends Error {
  constructor(nodes) {
    let stripped = _.map(nodes, (n) => {
      return {
        pkgMeta: {
          name: n.pkgMeta.name,
          version: n.pkgMeta.version
        },
        dependencies: _.keys(n.dependencies)
      };
    });
    super('Sort Error. Unable to find edge in nodes: \n' + JSON.stringify(stripped, null, '  '));
  }
}

function sort(acc, remaining) {
  if (remaining.length === 0) {
    logger.silly('done return: ', JSON.stringify(acc));
    return acc;
  } else {
    logger.silly('[sort] acc: ', acc, 'remaining: ', remaining);
    let edgedNames = _.map(acc, 'pkgMeta.name');
    let allDependenciesOnEdge = (deps) => {
      let depNames = _.keys(deps);
      let notEdged = _.without(depNames, ...edgedNames);
      if (notEdged.length > 0) {
        logger.silly('[sort] these dependencies are not on edge: ', notEdged);
      }
      return notEdged.length === 0;
    };
    let group = (n) => {
      let keys = _.keys(n.dependencies);
      logger.silly('keys: ', keys);
      if (keys.length === 0) {
        return 'no-dependencies';
      }
      else if (allDependenciesOnEdge(n.dependencies)) {
        return 'all-edged';
      }
      else {
        return 'not-edged';
      }
    };
    let groupings = _.groupBy(remaining, group);
    logger.silly('groupings: ', groupings);
    let addToEdge = _.compact((groupings['no-dependencies'] || []).concat(groupings['all-edged'] || []));
    if (addToEdge.length === 0) {
      logger.info('[sort] accumulated before error: ', _.map(acc, (a) => new StrippedNode(a).toString()));
      let err = new SortError(remaining);
      throw err;
    }
    let trimmed = _.without(remaining, ...addToEdge);
    logger.silly('[sort] trimmed: ', trimmed);
    return sort(acc.concat(addToEdge), trimmed);
  }
}

/**
 * Top sorts the bower nodes to allow safe js loading in the client.
 * TODO: How to handle a hanging topsort? maybe return 2 lists 1. the topsorted and 2. the remaining items?
 */
function topSortBowerNodes(nodes) {
  logger.info('[sortBowerDependencies] nodes: ', _.map(nodes, (n) => new StrippedNode(n).toString()));
  return sort([], nodes);
}

exports.topSortBowerNodes = topSortBowerNodes;
exports.SortError = SortError;

