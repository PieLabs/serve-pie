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
  }

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
  
  logger.debug(`[sort] --> acc: ${acc.sorted.length}, remaining: ${remaining.length}`);
  
  if (remaining.length === 0) {
    logger.silly('done return: ', _.map(acc.sorted, 'pkgMeta.name'));
    return acc;
  } else {
    let edgedNames = _.map(acc.sorted, 'pkgMeta.name');
    let allDependenciesOnEdge = (deps) => {
      let depNames = _.keys(deps);
      let notEdged = _.without(depNames, ...edgedNames);
      if (notEdged.length > 0) {
        logger.silly('[sort] group - notEdged: ', notEdged);
      }
      return notEdged.length === 0;
    };
    let group = (n) => {
      logger.silly(`[sort] group ${n.pkgMeta.name}`);
      let keys = _.keys(n.dependencies);
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
    let addToEdge = _.compact((groupings['no-dependencies'] || []).concat(groupings['all-edged'] || []));
    if (addToEdge.length === 0) {
      logger.info('[sort] accumulated before error: ', _.map(acc.sorted, (a) => new StrippedNode(a).toString()));
      logger.warn(new SortError(remaining));
      return { sorted: acc.sorted, unsorted: remaining};
    }
    let trimmed = _.without(remaining, ...addToEdge);
    acc.sorted = acc.sorted.concat(addToEdge);
    return sort(acc, trimmed);
  }
}

/**
 * Top sorts the bower nodes to allow safe js loading in the client.
 * TODO: How to handle a hanging topsort? maybe return 2 lists 1. the topsorted and 2. the remaining items?
 */
function topSortBowerNodes(nodes) {
  logger.silly('[sortBowerDependencies] nodes: ', _.map(nodes, (n) => new StrippedNode(n).toString()));
  return sort({sorted: []}, nodes);
}

exports.topSortBowerNodes = topSortBowerNodes;
exports.SortError = SortError;

