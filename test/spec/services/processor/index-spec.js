const proxyquire = require('proxyquire');
const should = require('should');
const sinon = require('sinon');
const errorMsgs = require('../../../../lib/services/processor/error-msgs');

describe('processor', () => {

  let processor, pieProcessors;

  beforeEach(() => {
    let Processor = proxyquire('../../../../lib/services/processor', {});
    pieProcessors = [{
      component: { name: 'comp' },
      processor: {
        clean: (q) => {
          delete q.removeMe;
          return q;
        },
        model: (question, session, env) => {
          return {
            question: question,
            session: session,
            env: env
          }
        }
      }
    },
      {
        component: { name: 'comp-no-clean' },
        processor: {}
      }];

    processor = new Processor(pieProcessors);
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
          cleaned.should.eql([{ id: 'one', component: { name: 'comp-no-clean' } }]);
          done();
        }).catch(done);
    });

    it('calls the processor\'s clean function', (done) => {
      processor.clean([{ id: 'one', component: { name: 'comp' }, removeMe: 'hi', correctResponse: {} }])
        .then((cleaned) => {
          cleaned.should.eql([{ id: 'one', component: { name: 'comp' } }]);
          done();
        }).catch(done);
    });
  });


  describe('model', () => {

    let comp;
    let session;
    let env;

    beforeEach(() => {
      comp = { id: 'one', component: { name: 'comp' } };
      session = { id: 'one', response: 'apple' };
      env = { locale: 'en_US' };
    });

    it('calls model on the processors', () => {

      processor.model(
        [{ id: 'one', component: { name: 'comp' } }],
        [{ id: 'one', response: 'apple' }],
        { locale: 'en_US' }
      ).then((models) => {
        models[0].should.eql({
          question: question,
          session: session,
          env: env
        });
      });
    });
  });
});