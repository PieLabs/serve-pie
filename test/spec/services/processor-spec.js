const proxyquire = require('proxyquire');
const should = require('should');
const sinon = require('sinon');

describe('processor', () => {
  
  let processor;
    
  beforeEach(() => {
    let Processor = proxyquire('../../../lib/services/processor', {});
    processor = new Processor();
  }); 
  
  describe('createOutcomes', () => {
    
    it('creates the outcomes', (done) => {
      
      processor.createOutcomes([],[])
        .then((outcomes) => {
          outcomes.should.eql([]); 
        })
        .catch(done);
    });    
  }); 
});