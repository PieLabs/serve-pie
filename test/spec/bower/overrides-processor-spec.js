'use strict';

const proxyquire = require('proxyquire');
const sinon = require('sinon');
const should = require('should'); //eslint-disable-line 
const logFactory = require('../../../lib/log-factory');

describe('overrides-processor', () => {


  let fsExtra, processor;

  beforeEach(() => {

    logFactory.setConfig({ 'overrides-processor': 'silly' });

    fsExtra = {
      readJsonSync: sinon.stub().returns({}),
      statSync: sinon.stub().returns({isFile: () => true})
    };

    processor = proxyquire('../../../lib/bower/overrides-processor', {
      'fs-extra': fsExtra
    });

  });

  describe('process', () => {

    it('updates pkgMeta', () => {

      fsExtra.readJsonSync.withArgs('dependency-one/bower.json').returns({
        overrides: {
          'dependency-three': {
            main: ['one-override.js']
          }
        }
      });

      fsExtra.readJsonSync.withArgs('dependency-two/bower.json').returns({
        overrides: {
          'dependency-three': {
            main: ['two-override.js']
          }
        }
      });

      let out = processor.process({
        'dependency-one': {
          canonicalDir: 'dependency-one',
          pkgMeta: {
            main: ['index.js']
          }
        },
        'dependency-two': {
          canonicalDir: 'dependency-two',
          pkgMeta: {
            main: ['index.js']
          }
        },
        'dependency-three': {
          canonicalDir: 'dependency-three',
          pkgMeta: {
            main: ['index.js']
          }
        }
      });

      out['dependency-three'].pkgMeta.main.should.eql([
        'index.js',
        'one-override.js',
        'two-override.js'
      ]);
    });

    
    it('updates pkgMeta using override directives', () => {

      fsExtra.readJsonSync.withArgs('dependency-one/bower.json').returns({
        overrides: {
          'dependency-three': {
            main: ['one-override.js']
          }
        }
      });

      fsExtra.readJsonSync.withArgs('dependency-two/bower.json').returns({
        overrides: {
          'dependency-three': {
            main: {
              swap: {
                'index.js' : 'swapped.js'
              }
            } 
          }
        }
      });

      let out = processor.process({
        'dependency-one': {
          canonicalDir: 'dependency-one',
          pkgMeta: {
            main: ['index.js']
          }
        },
        'dependency-two': {
          canonicalDir: 'dependency-two',
          pkgMeta: {
            main: ['index.js']
          }
        },
        'dependency-three': {
          canonicalDir: 'dependency-three',
          pkgMeta: {
            main: ['index.js']
          }
        }
      });

      out['dependency-three'].pkgMeta.main.should.eql([
        'swapped.js',
        'one-override.js'
      ]);
    });
  });

});
