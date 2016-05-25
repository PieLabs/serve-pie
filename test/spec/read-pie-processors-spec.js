const proxyquire = require('proxyquire');
const should = require('should');
const sinon = require('sinon');

describe('read-pie-processors', () => {
  
  let read;
   
  beforeEach((done) => {
    
    read = proxyquire('../../lib/read-pie-processors', {
      'bower-dir/comp/bower.json' : {
        name: 'comp', 
        version: '0.0.1',
        '@noCallThru': true
      },
      'bower-dir/comp/processing.js' : {
        createOutcome: function(){
          return {correctness: 'correct'}
        },
        '@noCallThru': true
      },
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
    processors[0].component.should.eql({name: 'comp', version: '0.0.1'}); 
  });
  
  it('should return the name and version in the id', () => {
    processors[0].processor.createOutcome().should.eql({correctness: 'correct'}); 
  });
  
});