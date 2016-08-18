const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('fs-resolver', () => {

  let factory;
  let fsExtraPromise, tmp, bower;
  beforeEach(() => {

    fsExtraPromise = {
      isDirectoryAsync: sinon.stub().returns(Promise.resolve(true))
    };

    tmp = {};

    factory = proxyquire('../../../lib/bower/fs-resolver', {
      'fs-extra-promise': fsExtraPromise,
      'tmp': tmp
    });
    bower = {};
    instance = factory(bower);
  });

  describe('match', () => {

    let assertMatch = (char, expected) => {
      return it('returns ' + expected + ' if path starts with ' + char, (done) => {
        var result = instance.match(char);

        if (result === false) {
          result.should.eql(expected);
          done();
        } else {
          result
            .then((m) => {
              m.should.eql(expected);
              done();
            })
        }
      });
    };

    assertMatch('.', true);
    assertMatch('/', true);
    assertMatch('~', true);
    assertMatch('git', false);
  });

  describe('releases', () => {

    it('returns the version in the bower.json', (done) => {
      fsExtraPromise.readJsonAsync = sinon.stub().returns(Promise.resolve({version: '2.0.0'}));
      instance.releases('dir')
        .then((releases) => {
          releases[0].target.should.eql('2.0.0');
          done();
        });
    });
  
    it('returns 1.0.0 if version is undefined', (done) => {
      fsExtraPromise.readJsonAsync = sinon.stub().returns(Promise.resolve({version: undefined}));
      instance.releases('dir')
        .then((releases) => {
          releases[0].target.should.eql('1.0.0');
          done();
        });
    });
  });

  describe('fetch', () => {

    it('returns the tmpDir', (done) => {
      tmp.dirSync = sinon.stub().returns({name: 'tmpPath'});
      fsExtraPromise.realpathAsync = sinon.stub().returns(Promise.resolve('realpath'));
      fsExtraPromise.copyAsync = sinon.stub().returns(Promise.resolve());
      instance.fetch({source: 'endpoint'})
        .then((result) => {
          result.tempPath.should.eql('tmpPath');
          result.removeIgnores.should.eql(true);
          done();
        })
        .catch(done);
    });
  });
});