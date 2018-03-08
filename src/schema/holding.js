import mongoose from 'mongoose';

const holdingSchema = mongoose.Schema({
  symbol: String,
  amount: Number
});

const Holding = mongoose.model('Holding', holdingSchema);

export default Holding;