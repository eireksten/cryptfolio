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
  },
  persist: {
    type: Boolean,
    default: false
  }
});

const HistoryEntry = mongoose.model('HistoryEntry', historyEntrySchema);

export {
  historyEntrySchema,
  HistoryEntry
};

export default HistoryEntry;