const proxyquire = require('proxyquire');
const sinon = require('sinon');
const should = require('should');

describe('read-item-dependencies', () => {

  let read, fs, path;

  beforeEach(() => {

    fs = {
      readJsonSync: sinon.stub().returns({
        dependencies: {
          comp :  'path'
        }
      }),
      lstatSync: sinon.stub().returns({ isDirectory: () => true })
    };


    path = {
      resolve: sinon.stub().returns('resolved')
    };

    read = proxyquire('../../lib/read-item-dependencies', {
      'fs-extra': fs,
      path: path
    });
  });

  it('skips paths that do not exist', () => {
    fs.readJsonSync.returns({
      dependencies: {
        comp: 'bad-path'
      }
    });

    fs.lstatSync.throws(new Error(''));
    read('dir').should.eql({});
  });

  it('skips paths that are not directories', () => {

    fs.readJsonSync.returns({
      dependencies: {
        comp: 'not-a-dir.txt'
      }
    });

    fs.lstatSync.returns({isDirectory: () => false});
    read('dir').should.eql({});
  });


  it('relativises the paths', () => {
    read('dir').should.eql({
      comp: 'resolved'
    });

  });
});