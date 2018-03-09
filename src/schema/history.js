import mongoose from 'mongoose';
import {historyEntrySchema} from './history_entry.js';

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
  History,
  historySchema
};

export default History;