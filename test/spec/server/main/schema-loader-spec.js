const proxyquire = require('proxyquire');
const sinon = require('sinon');
const should = require('should');

describe('schema-loader', () => {

  let load, result, glob;

  beforeEach(() => {
    
    glob = {
      sync: sinon.stub().returns(['a.json'])
    }

    load = proxyquire('../../../../lib/server/main/schema-loader', {
      glob: glob,
      'fs-extra': {
        readJSONSync: sinon.spy(function (path) {
          return { path: path };
        })
      }
    });
    result = load('dir');
  });

  it('returns the result', () => result.should.eql([{ path: 'a.json' }]));
  it('calls glob.sync', () => sinon.assert.calledWith(glob.sync, 'dir/**/*.json'));
});