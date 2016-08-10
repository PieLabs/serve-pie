const proxyquire = require('proxyquire');
const should = require('should');
const sinon = require('sinon');

describe('read-pie-processors', () => {

  let read, mockScript, fsExtra;

  beforeEach((done) => {

    mockScript = {
      runInNewContext: function (sandbox) {
        sandbox.exports.createOutcome = function () {
          return { correctness: 'correct' };
        };
      }
    };

    fsExtra = {
      readJsonSync: sinon.stub().returns({
        name: 'name',
        version: 'version'
      }),
      readFileSync: sinon.stub().returns(''),
      existsSync: sinon.stub().returns(true)
    };

    read = proxyquire('../../../../lib/services/processor/read-pie-processors', {
      'fs-extra': fsExtra,
      'vm': {
        Script: function () { return mockScript; }
      }
    });

    read({ 'comp': '' }, 'bower-dir')
      .then((result) => {
        processors = result;
        done();
      })
      .catch(done);

  });

  it('should return the processors', () => {
    processors.length.should.eql(1);
  });

  it('should return the name and version in the id', () => {
    processors[0].component.should.eql({ name: 'name', version: 'version' });
  });

  it('loads controller.js', () => {
    sinon.assert.calledWith(fsExtra.readFileSync, 'bower-dir/comp/controller.js');
  });

  it('loads legacy processing.js if controller.js doesnt exist', (done) => {
    fsExtra.existsSync.reset();
    fsExtra.existsSync.onCall(0).returns(false);
    fsExtra.existsSync.onCall(1).returns(true);
    read({ 'comp': '' }, 'bower-dir')
      .then((result) => {
        sinon.assert.calledWith(fsExtra.readFileSync, 'bower-dir/comp/processing.js');
        done();
      })
      .catch(done);
  });
});