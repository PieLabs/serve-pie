const proxyquire = require('proxyquire');
const sinon = require('sinon');
const should = require('should');

describe('asset-utils', () => {

  let utils = require('../../../../../lib/server/demo/page/asset-utils');

  describe('mergeAssets', () => {

    let assets = (name, restrict) => {
      return {
        js: restrict === undefined || restrict === 'js' ? [name + '.js'] : [],
        css: restrict === undefined || restrict === 'css' ? [name + '.css'] : [],
        htmlImports: restrict === undefined || restrict === 'html' ? [name + '.html'] : []
      }
    }

    let all = [
      assets('a'),
      assets('b')
    ];

    it('an empty array returns an empty asset', () => {
      utils.mergeAssets([]).should.eql(utils.emptyAsset('merged'));
    });

    it('merges js', () => {
      utils.mergeAssets([
        assets('a', 'js'), 
        assets('b', 'js')
      ])
        .should.eql({id: 'merged', js: ['a.js', 'b.js'], css: [], htmlImports: []});
    });

    it('merges css', () => {
      utils.mergeAssets([
        assets('a', 'css'),
        assets('b', 'css')
      ]).should.eql({id: 'merged', css: ['a.css', 'b.css'], js: [], htmlImports: []});
    });

    it('merges htmlImports', () => {
      utils.mergeAssets([
        assets('a', 'html'),
        assets('b', 'html')
      ]).should.eql({id: 'merged', css: [], js: [], htmlImports: ['a.html', 'b.html']});
    });
    
    it('merges all', () => {
      utils.mergeAssets([
        assets('a'),
        assets('b')
      ]).should.eql(
        {id: 'merged', css: ['a.css', 'b.css'], 
        js: ['a.js', 'b.js'], 
        htmlImports: ['a.html', 'b.html']});
    });
  });

  describe('pkgMetaToAssets', () => {
    it('returns assets when main is string', () => {
      let id = {name: 'a', version: '1'};
      let result = utils.pkgMetaToAssets(id, {
        main: 'a.js'
      });
      result.should.eql({id: id,js: ['a.js'], css: [], htmlImports: []});
    });
    
    it('returns assets when main is array', () => {
      let id = {name: 'a', version: '1'};
      let result = utils.pkgMetaToAssets(id, {
        main: ['a.js', 'a.css']
      });
      result.should.eql({id: id,js: ['a.js'], css: ['a.css'], htmlImports: []});
    });
  });

  describe('mapPaths', () => {

    it('maps paths', () => {
      let result = utils.mapPaths([{id: {name:'a'}, js: ['a.js']}], (name, path) => `!${name}-${path}`);
      result.should.eql([{js: ['!a-a.js'], css: [], htmlImports: []}]);
    });
  });
});