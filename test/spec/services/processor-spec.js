const proxyquire = require('proxyquire');
const should = require('should');
const sinon = require('sinon');

describe('processor', () => {

  let processor, pieProcessors;

  beforeEach(() => {
    let Processor = proxyquire('../../../lib/services/processor', {});
    pieProcessors = [{
      component: { name: 'comp' },
      processor: {
        createOutcome: () => {
          return { correctness: 'mocked' };
        },
        clean: (q) => {
          delete q.removeMe;
          return q;
        }
      }
    },
    {
      component: { name: 'comp-no-clean' },
      processor: {}
    }];
    
    processor = new Processor(pieProcessors);
  });

  describe('createOutcomes', () => {

    it('return an empty array, for empty questions', (done) => {
      processor.createOutcomes([], [])
        .then((outcomes) => {
          outcomes.should.eql([]);
          done();
        }).catch(done);
    });

    it('returns an error if a processor can not be found', (done) => {
      processor.createOutcomes([{ component: { name: 'missing-comp', version: '1.0.0' } }], [])
        .then((outcomes) => {
          outcomes[0].error.should.eql(processor.errors.missingComponent('missing-comp').error);
          done();
        }).catch(done);
    });


    it('returns an error if the session cant be found', (done) => {
      processor.createOutcomes([{ id: 'one', component: { name: 'comp', version: '1.0.0' } }], [])
        .then((outcomes) => {
          outcomes[0].error.should.eql(processor.errors.missingSession('one').error);
          done();
        }).catch(done);
    });

    it('returns the outcome', (done) => {
      processor.createOutcomes([{ id: 'one', component: { name: 'comp', version: '1.0.0' } }], [{
        id: 'one',
        response: 'blah'
      }])
        .then((outcomes) => {
          outcomes[0].outcome.should.eql(pieProcessors[0].processor.createOutcome());
          done();
        }).catch(done);
    });
  });

  describe('clean', () => {
    it('cleans correctResponse by default', (done) => {
      processor.clean([{ id: 'one', correctResponse: {} }])
        .then((cleaned) => {
          cleaned.should.eql([{ id: 'one' }]);
          done();
        }).catch(done);
    });

    it('only does a default clean if the processor doesnt have a clean function', (done) => {
      processor.clean([{ id: 'one', component: { name: 'comp-no-clean' }, correctResponse: {} }])
        .then((cleaned) => {
          cleaned.should.eql([{ id: 'one', component: {name: 'comp-no-clean'} }]);
          done();
        }).catch(done);
    });
    
    it('calls the processor\'s clean function', (done) => {
      processor.clean([{ id: 'one', component: { name: 'comp' }, removeMe: 'hi', correctResponse: {} }])
        .then((cleaned) => {
          cleaned.should.eql([{ id: 'one', component: {name: 'comp'} }]);
          done();
        }).catch(done);
    });
  });
});