import mongoose from 'mongoose';

const historyEntrySchema = mongoose.Schema({
  price: {
    type: Number,
    required: true,
    min: 0.00000001
  },
  timestamp: {
    type: Number,
    required: true,
    min: 0
  }
});

const HistoryEntry = mongoose.model('HistoryEntry', historyEntrySchema);

const historySchema = mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  denomination: {
    type: String,
    default: 'BTC',
    uppercase: true,
    trim: true
  },
  history: [ historyEntrySchema ]
});

const History = mongoose.model('History', historySchema);

export {
  HistoryEntry,
  History
}

export default History;