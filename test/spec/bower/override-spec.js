'use strict';

const should = require('should'); //eslint-disable-line 

describe('override', () => {

  let Override;

  beforeEach(() => {
    Override = require('../../../lib/bower/override');
  });


  describe('fromMain', () => {

    it('sets strings to add', () => {
      Override.fromMain('a.js').config.add.should.eql(['a.js']);
    });

    it('sets array to add', () => {
      Override.fromMain(['a.js']).config.add.should.eql(['a.js']);
    });

    it('sets object to config', () => {
      Override.fromMain({}).config.should.eql({});
    });

    it('sets null to config', () => {
      Override.fromMain(null).config.should.eql({});
    });

    it('sets undefined to config', () => {
      Override.fromMain(undefined).config.should.eql({});
    });

  });
  
  describe('apply', () => {


    describe('add', () => {

      it('adds a dependency', () => {
        let override = new Override({
          add: ['a.js']
        });
        override.apply([]).should.eql(['a.js']);
      });

      it('removes undefined', () => {
        let override = new Override({
          add: ['a.js']
        });
        override.apply([undefined]).should.eql(['a.js']);
      });
    });

    describe('remove', () => {

      it('removes a dependency', () => {
        let override = new Override({
          remove: ['a.js']
        });
        override.apply(['a.js', 'b.js']).should.eql(['b.js']);
      });
    });

    describe('swap', () => {

      it('swaps a dependency', () => {

        let override = new Override({
          swap: {
            'a.js': 'swapped-a.js',
            'b.js': 'swapped-b.js'
          }
        });
        override.apply(['a.js']).should.eql(['swapped-a.js']);
      });
    });
  });

});
