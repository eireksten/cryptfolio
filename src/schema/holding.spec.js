import { expect } from 'chai';
import Holding from './holding.js';

describe('Holding', function() {

  describe('#validate', function () {

    it('should be valid for appropriate entry', function (done) {
      const hodling = new Holding({
        symbol: 'BTC',
        amount: 0.1
      });

      hodling.validate(function (err) {
        expect(err).to.not.exist;
        done();
      });

    });

    it('should be invalid if symbol is empty', function (done) {
      const hodling = new Holding();

      hodling.validate(function (err) {
        expect(err.errors.symbol).to.exist;
        done();
      });
    });

    it('should be invalid if amount is negative', function (done) {
      const hodling = new Holding({
        symbol: 'BTC',
        amount: -1.0
      });
      hodling.validate(function (err) {
        expect(err.errors.amount).to.exist;
        done();
      });
    });

  });

  describe('#defaults', function () {

    it('should default amount to zero', function () {
      const holding = new Holding({
        symbol: 'BTC'
      });
      expect(holding.amount).to.be.equal(0);
    });

  });

});