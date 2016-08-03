'use strict';
const _ = require('lodash');
const logFactory = require('../../../lib/log-factory');
logFactory.setDefaultLevel('warn');
const sortBowerDependencies = require('../../../lib/bower/sort-bower-dependencies');
const should = require('should');

describe('sort-bower-dependencies', () => {

  it('returns an empty array', () => {
    sortBowerDependencies.topSortBowerNodes([]).should.eql({sorted: []});
  });

  it('returns 1 node in array', () => {
    var one = {
      pkgMeta: {
        name: 'one',
        version: '0.0.1'
      },
      dependencies: {}
    };
    sortBowerDependencies.topSortBowerNodes([one]).should.eql({sorted: [one]});
  });
  
  var mkNode = function (name, deps) {
    deps = deps || {};
    return {
      pkgMeta: {
        name: name,
        version: '0.0.1'
      },
      dependencies: deps
    };
  };
  
  it('returns 2 nodes in array', () => {
    var two = mkNode('two');
    var one = mkNode('one', { two: two });
    var sorted = sortBowerDependencies.topSortBowerNodes([one, two]);
    _.map(sorted.sorted, 'pkgMeta.name').should.eql(['two', 'one']);
  });
  
  it('returns 3 nodes in array, preserves order if both have same dependency', () => {
    var three = mkNode('three');
    var two = mkNode('two', { three: three });
    var one = mkNode('one', { three: three });
    var sorted = sortBowerDependencies.topSortBowerNodes([one, two, three]);
    _.map(sorted.sorted, 'pkgMeta.name').should.eql(['three', 'one', 'two']);
  });
  
  it('returns 3 nodes in array', () => {
    var three = mkNode('three');
    var two = mkNode('two', { three: three });
    var one = mkNode('one', { two: two });
    var sorted = sortBowerDependencies.topSortBowerNodes([one, two, three]);
    _.map(sorted.sorted, 'pkgMeta.name').should.eql(['three', 'two', 'one']);
  });
  
  it('cyclical dependencies throw an error', () => {
    var two = mkNode('two', { one: mkNode('one') });
    var one = mkNode('one', { two: two });
    var result = sortBowerDependencies.topSortBowerNodes([one, two]);
    result.unsorted.should.eql([one, two]);
  });
  
  it('nested cyclical dependencies throw an error', () => {
    var four = mkNode('four', { three: mkNode('three') });
    var three = mkNode('three', { four: four });
    var two = mkNode('two', { three: three });
    var one = mkNode('one', { two: two });
    var result = sortBowerDependencies.topSortBowerNodes([one, two, three, four]);
    result.unsorted.should.eql([one, two, three, four])
  });
  
  it('four dependencies should be sorted', () => {
    var four = mkNode('four');
    var three = mkNode('three', { four: four });
    var two = mkNode('two', { three: three });
    var one = mkNode('one', { two: two });
    var result = sortBowerDependencies.topSortBowerNodes([one, two, three, four]);
    _.map(result.sorted, 'pkgMeta.name').should.eql(['four', 'three', 'two', 'one']);
  });
  
});
