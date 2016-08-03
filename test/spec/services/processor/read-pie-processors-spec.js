const proxyquire = require('proxyquire');
const should = require('should');
const sinon = require('sinon');

describe('read-pie-processors', () => {
  
  let read;
  
  let mockScript; 
     
  beforeEach((done) => {
    
    mockScript = {
      runInNewContext: function(sandbox){
        sandbox.exports.createOutcome = function(){
          return {correctness: 'correct'};
        };
      }
    };
    
    read = proxyquire('../../../../lib/services/processor/read-pie-processors', {
      'fs-extra' : {
        readJsonSync: sinon.stub().returns({
          name: 'name',
          version: 'version'
        }),
        readFileSync: sinon.stub().returns('')
      },
      'vm' : {
        Script: function() { return mockScript; }
      }
    });    
    
    read({'comp': ''}, 'bower-dir')
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
    processors[0].component.should.eql({name: 'name', version: 'version'}); 
  });
  
  it('should return the name and version in the id', () => {
    processors[0].processor.createOutcome().should.eql({correctness: 'correct'}); 
  });
  
});