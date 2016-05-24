"use strict";

const proxyquire = require('proxyquire');
const sinon = require('sinon');
const should = require('should');

describe('resolution-report', () => {

  let pkgMeta = (name, version) => {
    version = version === undefined ? '1.0.0' : version;
    return {
      name: name,
      version: version
    }
  }

  let sample = {
    a: { pkgMeta: pkgMeta('a') },
    b: { pkgMeta: pkgMeta('b') }
  };

  let report, ResolutionReport, sortBowerDependencies, fsExtra;

  beforeEach(() => {

    sortBowerDependencies = {
      topSortBowerNodes: sinon.stub().returnsArg(0)
    }

    fsExtra = {
      readJSONSync: sinon.stub().returns({})
    };

    ResolutionReport = proxyquire('../../../lib/bower/resolution-report', {
      'fs-extra': fsExtra,
      './sort-bower-dependencies': sortBowerDependencies
    });

    report = new ResolutionReport(sample);
  });

  describe('fromPath', () => {
    beforeEach(() => {
      report = ResolutionReport.fromPath('path');
    });
    
    it('creates a new report', () => {
      report.should.exist; 
    });
    
    it('calls fsExtra.readJSONSync', () => {
      sinon.assert.calledWith(fsExtra.readJSONSync, 'path');
    });
  });
  describe('dependencies', () => {


    it('returns an empty array for an empty report', () => {
      report = new ResolutionReport({});
      report.dependencies.should.eql([]);
    });

    it('returns the pkgMeta from each bower node', () => {
      report.dependencies.should.eql([sample.a.pkgMeta, sample.b.pkgMeta]);
    });
  });

  describe('pie uses', () => {
    beforeEach(() => {

      let newSample = {
        a: {
          pkgMeta: {
            name: 'a',
            dependencies: {
              'dep-one': '1.0.0'
            }
          }
        }
      }
      report = new ResolutionReport(newSample);
    });

    it('returns true if the node has a dependency', () => {
      report.pieUses('a', 'dep-one').should.eql(true);
    });

    it('returns false if the node doesnt have a dependency', () => {
      report.pieUses('a', 'dep-two').should.eql(false);
    })

  });
});