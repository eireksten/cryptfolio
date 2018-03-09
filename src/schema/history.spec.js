import { expect } from 'chai';
import History from './history.js';

describe('History', function () {

  describe('#validate', function () {

    it('should be valid if appropriate entry', function (done) {
      const history = new History({
        symbol: 'ETH',
        denomination: 'BTC',
        history: [
          {price: 0.1, timestamp: Date.now()},
          {price: 0.11, timestamp: Date.now() - 1000}
        ]
      });

      history.validate(function (err) {
        expect(err).to.not.exist;
        done();
      });
    });

    it('should be invalid if empty symbol', function (done) {
      const history = new History({});
      history.validate(function (err) {
        expect(err.errors.symbol).to.exist;
        done();
      });
    });
  });

  describe('#defaults', function () {
    it('should default to BTC denomination and empty history', function () {
      const history = new History({
        symbol: 'ETH'
      });
      expect(history.denomination).to.equal('BTC');
    });

    it('should default to empty history', function () {
      const history = new History({
        symbol: 'ETH'
      });
      expect(history.history).to.be.an.instanceof(Array);
      expect(history.history.length).to.equal(0);
    });
  });

});
