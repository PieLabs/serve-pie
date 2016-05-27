const should = require('should');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

require('../../../lib/log-factory').setDefaultLevel('info');

function MockEmitter(emitterName) {
  var handlers = {};

  this.on = function (name, handler) {
    handlers[name] = handler;
    return this;
  };

  this.trigger = function () {
    let args = Array.prototype.slice.call(arguments);
    let name = args.shift();
    if (handlers[name]) {
      handlers[name].apply(null, args);
    } else {
      throw new Error('no handler for: ', name);
    }
  };
}

describe('bower-dir', () => {

  "use strict";

  let BowerDir, bowerDir;
  let childProcess, fsExtra, bower, installEmitter, resolutionReport;
  beforeEach(() => {

    installEmitter = new MockEmitter('install');

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
    };

    resolutionReport = {
      fromPath: sinon.stub().returns({})
    };

    BowerDir = proxyquire('../../../lib/bower/bower-dir', {
      'child_process': childProcess,
      'fs-extra': fsExtra,
      'bower': bower,
      'bower-config': {
        read: function () {
          return { directory: 'bower_components' }
        }
      },
      './resolution-report': resolutionReport
    });
    bowerDir = new BowerDir('dir');
  });

   
  describe('components', () => {
    it('returns the components', () => {
      bowerDir.components().should.eql('dir/bower_components')
    });
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

      bowerDir.localInstall({ a: 'path/to/a' })
        .then((obj) => {
          result = obj;
          done();
        })
        .catch(done);

      installEmitter.trigger('end', { a: {}, b: {} });
    });
    it('calls bower.commands.install', () => {
      sinon.assert.calledWith(bower.commands.install, [], sinon.match.any, {});
    });

    it('calls resolutionReport.fromPath', () => {
      sinon.assert.called(resolutionReport.fromPath);
    });

    it('writes out the tmp bower.json', () => {
      sinon.assert.calledWith(fsExtra.writeJSONSync, 'dir/bower.json', {
        name: 'tmp-bower-config',
        version: '1.0.0',
        dependencies: {
          a: 'path/to/a'
        }
      });
    });

    it('removes the tmp bower.json', () => {
      sinon.assert.calledWith(fsExtra.unlinkSync, 'dir/bower.json');
    });

    it('writes out the report', () => {
      sinon.assert.calledWith(fsExtra.writeJSONSync, 'dir/.bower.installed.json', { a: {}, b: {} });
    });
  });
  
  
  describe('linkDependencies', () => {
    
    beforeEach((done) => {
      
      fsExtra.lstatSync = sinon.stub().returns({isDirectory: () => true});
      fsExtra.existsSync = sinon.stub().returns(true); 
      bowerDir.link = sinon.stub().returns(Promise.resolve({}));
      bowerDir.linkDependencies({
        name: '../../'
      })
      .then(() =>{
        done();
      })
      .catch(() => {
        done();
      });
    });   
    
    it('iterates through then links', () => {
      
    });
    
  });
  
  describe('link', () => {

    let successful;
    let link, linkPromise, firstEmitter, secondEmitter;

    beforeEach(() => {
      firstEmitter = new MockEmitter('first');
      secondEmitter = new MockEmitter('second');
      let stub = sinon.stub();
      stub.onCall(0).returns(firstEmitter);
      stub.onCall(1).returns(secondEmitter);
      bower.commands.link = stub;
      linkPromise = bowerDir.link('name', '../');
    });

    describe('when dependency link fails', () => {

      let error;

      beforeEach((done) => {
        linkPromise
          .catch((e) => {
            error = e;
            done();
          });
        firstEmitter.trigger('error', new Error('e'));
      });

      it('returns the error in the catch', () => {
        error.should.eql(new Error('e'));
      });
    });
    
    describe('when current link to dependency fails', () => {

      let error;

      beforeEach((done) => {
        linkPromise
          .catch((e) => {
            error = e;
            done();
          });
        firstEmitter.trigger('end');
        secondEmitter.trigger('error', new Error('e'));
      });

      it('returns the error in the catch', () => {
        error.should.eql(new Error('e'));
      });
    });

    describe('when successful', () => {

      beforeEach((done) => {
        linkPromise
          .then((s) => {
            successful = s;
            done();
          });
        firstEmitter.trigger('end');
        secondEmitter.trigger('end');
      });

      it('links successfully', () => {
        successful.should.eql(true);
      });

      it('calls link on the dependency', () => {
        bower.commands.link.calledWith();
      });

      it('calls link for the dependency on the current dir', () => {
        bower.commands.link.calledWith('name');
      });

    });
  });
});