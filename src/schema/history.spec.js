import { expect } from 'chai';
import History, { HistoryEntry } from './history.js';

describe('HistoryEntry', function () {

  describe('#validate', function () {
    it('should be valid for appropriate entry', function (done) {
      const historyEntry = new HistoryEntry({
        symbol: 'ETH',
        price: 0.1,
        timestamp: Date.now()
      });

      historyEntry.validate(function (err) {
        expect(err).to.not.exist;
        done();
      });

    });

    it('should be invalid if price is empty', function (done) {
      const historyEntry = new HistoryEntry({
        timestamp: Date.now()
      });
      historyEntry.validate(function (err) {
        expect(err.errors.price).to.exist;
        done();
      });
    });

    it('should be invalid if price is negative', function (done) {
      const historyEntry = new HistoryEntry({
        price: -0.00000001,
        timestamp: Date.now()
      });
      historyEntry.validate(function (err) {
        expect(err.errors.price).to.exist;
        done();
      });

    });

    it('should be invalid if price is zero', function (done) {
      const historyEntry = new HistoryEntry({
        price: 0,
        timestamp: Date.now()
      });
      historyEntry.validate(function (err) {
        expect(err.errors.price).to.exist;
        done();
      });

    });

    it('should be invalid if timestamp is empty', function (done) {
      const historyEntry = new HistoryEntry({
        price: 0.1
      });
      historyEntry.validate(function (err) {
        expect(err.errors.timestamp).to.exist;
        done();
      });
    });

    it('should be invalid if timestamp is not a number', function (done) {
      const historyEntry = new HistoryEntry({
        price: 0.1,
        timestamp: 'Jan 01 2018 10:00'
      });

      historyEntry.validate(function (err) {
        expect(err.errors.timestamp).to.exist;
        done();
      });

    });
  });
});

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
