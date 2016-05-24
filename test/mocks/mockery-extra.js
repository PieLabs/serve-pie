const mockery = require('mockery');
const sinon = require('sinon');

var me = {};

var mockLogFactory = {
  fileLogger: sinon.stub().returns({
    debug: sinon.stub(),
    info: sinon.stub()
  })
};

me.mockLogFactory = function(path){
  mockery.registerMock(path, mockLogFactory);
};

Object.keys(mockery).forEach(function (key) {
  me[key] = mockery[key];
});

module.exports = me; 