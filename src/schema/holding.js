import mongoose from 'mongoose';

const holdingSchema = mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    index: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  amount: {
    type: Number,
    default: 0,
    min: 0
  }
});

holdingSchema.statics.setCurrency = function (symbol, amount) {

  return this.findOneAndUpdate(
      { symbol: symbol },
      { amount: amount },
      {
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
  ).exec();

};

holdingSchema.statics.addCurrency = function (symbol, amount) {

  return this.findOne({symbol: symbol}).exec()
      .then((holding) => {
        if (!holding) {
          return new Holding({
            symbol: symbol,
            amount: amount
          });
        }
        holding.amount += amount;
        return holding;
      })
      .then((holding) => holding.save());

};

holdingSchema.statics.deleteHolding = function (symbol) {
  return this.findOne({symbol: symbol}).exec()
      .then((holding) => {
        if (!holding)return Promise.reject('Currently not holding this currency.');
        return holding;
      })
      .then((holding) => holding.remove());
};

holdingSchema.statics.removeCurrency = function (symbol, amount) {

  return Holding.findOne({symbol: symbol}).exec()
      .then((holding) => {
        if (!holding)
          return Promise.reject('Currently not holding this currency');

        if (holding.amount < amount)
          return Promise.reject('Trying to remove more than current amount');

        holding.amount -= amount;
        // TODO If amount is approx 0, delete?
        return holding;

      })
      .then((holding) => holding.save());

};

const Holding = mongoose.model('Holding', holdingSchema);

export default Holding;