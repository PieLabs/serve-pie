const should = require('should');
const utils = require('../../../../lib/server/routes/utils');

describe('utils', () => {
  describe('urlFromReferer', () => {

    it('uses Referer header', () => {
      let url = utils.urlFromReferer({
        protocol: 'http',
        headers: {
          Referer: 'ref:5000',
          host: 'host:5000'
        }
      });
      url.should.eql('http://ref:5000');
    });

    it('uses falls back to host header', () => {
      let url = utils.urlFromReferer({
        protocol: 'http',
        headers: {
          host: 'host:5000'
        }
      });
      url.should.eql('http://host:5000');
    });

  });
})