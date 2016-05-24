const should = require('should');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('bower-dir', () => {

  "use strict";

  let BowerDir, bowerDir;
  let childProcess, fsExtra, bower, installEmitter, resolutionReport;
  beforeEach(() => {
    
    installEmitter = {};
    installEmitter.on = (name, handler) => {
      
      if(name === 'end'){
        handler({a: {}, b: {}});
      }
      return installEmitter;
    }; 
    
    bower = {
      commands: {
        install: sinon.stub().returns(installEmitter)
      } 
    };
    
    childProcess = {
      exec: sinon.stub().callsArgWith(1, null)
    };
    fsExtra = {
      existsSync: sinon.stub(),
      readJSONSync: sinon.stub().returns({}),
      writeJSONSync: sinon.stub(),
      unlinkSync: sinon.stub(),
      openSync: sinon.stub()
    }
    
    resolutionReport = sinon.stub().returns({}); 
    
    BowerDir = proxyquire('../../../lib/bower/bower-dir', {
      'child_process': childProcess,
      'fs-extra': fsExtra,
      'bower' : bower,
      './resolution-report' : resolutionReport
    });
    bowerDir = new BowerDir('dir');
  });

  describe('components', () => {
    it('returns the components', () => {
      bowerDir.components().should.eql('dir/bower_components')
    })
  });

  describe('clean', () => {
    it('calls exec', (done) => {
      bowerDir.clean()
        .then(() => {
          sinon.assert.calledWith(childProcess.exec, 'rm -rf dir/bower_components', sinon.match.func);
          done();
        })
        .catch(done);
    });

    it('rejects if exec fails', (done) => {
      childProcess.exec.callsArgWith(1, 'err');
      bowerDir.clean()
        .then(() => {
          done('should have failed');
        })
        .catch((e) => {
          let err;
          try {
            e.should.eql('rm -rf failed for: dir/bower_components');
          } catch (e) {
            err = e;
          } finally {
            done(err);
          }
        });
    });
  });

  describe('isInstalled', () => {

    it('returns true when comps and report exists', () => {
      fsExtra.existsSync.onCall(0).returns(true).onCall(1).returns(true);
      bowerDir.isInstalled().should.eql(true);
    });
    
    it('returns false when comps exist and report does not', () => {
      fsExtra.existsSync.onCall(0).returns(true).onCall(1).returns(false);
      bowerDir.isInstalled().should.eql(false);
    });
    
    it('returns false when comps dont exist and the report does', () => {
      fsExtra.existsSync.onCall(0).returns(false).onCall(1).returns(true);
      bowerDir.isInstalled().should.eql(false);
    });
  });
  
  describe('localInstall', () => {
    
    let result;     
    beforeEach((done) => {
      bowerDir.localInstall({a: 'path/to/a'})
        .then((obj) => {
          result = obj;
          done();
        })
        .catch(done);
    });
    it('calls bower.commands.install', () => {
      sinon.assert.calledWith(bower.commands.install, [], sinon.match.any, {});
    });
    
    it('creates a new resolution report', () => {
      sinon.assert.calledWithNew(resolutionReport);
    });
    
    it('writes out the tmp bower.json', () => {
      sinon.assert.calledWith(fsExtra.writeJSONSync, 'dir/bower.json', {
        name: 'tmp-bower-config',
        version: '1.0.0',
        dependencies: {
          a: 'path/to/a'
        },
        resolutions: {}
      });
    });
    
    it('removes the tmp bower.json', () => {
      sinon.assert.calledWith(fsExtra.unlinkSync, 'dir/bower.json');
    });
    
    it('writes out the report', () => {
      sinon.assert.calledWith(fsExtra.writeJSONSync, 'dir/.bower.installed.json', {a: {}, b: {}});
    });
  });
});