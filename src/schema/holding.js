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

const Holding = mongoose.model('Holding', holdingSchema);

export default Holding;