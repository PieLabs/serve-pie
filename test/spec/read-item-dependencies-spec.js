const proxyquire = require('proxyquire');
const sinon = require('sinon');
const should = require('should');

describe('read-item-dependencies', () => {

  let read, fs, path, dependencyHelper;

  beforeEach(() => {

    fs = {
      existsSync: sinon.stub().returns(true),
      readJsonSync: sinon.stub().returns({
        dependencies: {
          comp: 'path'
        }
      })
    };


    path = {
      resolve: sinon.stub().returns('resolved')
    };

    dependencyHelper = {
      isGitUrl: sinon.stub().returns(true),
      isSemver: sinon.stub().returns(true),
      pathIsDir: sinon.stub().returns(true)
    };

    read = proxyquire('../../lib/read-item-dependencies', {
      'fs-extra': fs,
      path: path,
      './npm/dependency-helper' : dependencyHelper
    });
  });

  it('throws an error if the file doesnt exist', () => {
    fs.existsSync.returns(false);
    should.throws(
      () => read('i-dont-exist'));
  });

  it('skips paths that do not exist', () => {
    fs.readJsonSync.returns({
      dependencies: {
        comp: 'bad-path'
      }
    });

    dependencyHelper.isGitUrl.returns(false);
    dependencyHelper.isSemver.returns(false);
    dependencyHelper.pathIsDir.returns(false);
    read('dir').should.eql({});
  });

  it('works with # in git url', () => {
    let gitUrl = 'git@bitbucket.org:pielibs/pie-xapi.git#feature/generic'
    fs.readJsonSync.returns({
      dependencies: {
        gitUrl: gitUrl
      }
    });

    read('dir').should.eql({
      gitUrl: gitUrl
    });
  });

  it('passes through git urls', () => {
    fs.readJsonSync.returns({
      dependencies: {
        gitUrl: 'git@github.com:blah/blah.git'
      }
    });

    read('dir').should.eql({
      gitUrl: 'git@github.com:blah/blah.git'
    });
  });

  it('passes through semvers', () => {
    fs.readJsonSync.returns({
      dependencies: {
        semver: '1.1.1'
      }
    });

    read('dir').should.eql({
      semver: '1.1.1'
    });
  });

  it('relativises the paths', () => {
    dependencyHelper.isGitUrl.returns(true);
    dependencyHelper.isSemver.returns(true);
    dependencyHelper.pathIsDir.returns(true);
    read('dir').should.eql({
      comp: 'resolved'
    });
  });
});