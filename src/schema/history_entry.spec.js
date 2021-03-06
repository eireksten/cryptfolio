import { expect } from 'chai';
import HistoryEntry from './history_entry.js';

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