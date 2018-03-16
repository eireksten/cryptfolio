import mongoose from 'mongoose';
import _ from 'lodash';
import moment from 'moment';

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
  lastTimestamp: {
    type: Number,
    min: 0
  },
  history: [ historyEntrySchema ]
});

historySchema.methods.getLatestHistoryEntry = function () {
  return _.last(this.history);
};

historySchema.methods.getPriceChangeSince = function (since = 60 * 60 * 1000) {
  return this.getPriceChangeBetween(since);

};

function findClosestHistoryEntry(entrylist, date) {

  let min = 0, max = entrylist.length - 1;
  while(min < max) {
    let mid = Math.floor((min + max + 1) / 2); // Rounding up
    if (entrylist[mid].timestamp >= date)max = mid - 1;
    else min = mid;
  }

  if (min === entrylist.length - 1)return entrylist[min];

  const mindiff = Math.abs(entrylist[min].timestamp - date);
  const nextdiff = Math.abs(entrylist[min + 1].timestamp - date);
  if (mindiff < nextdiff)return entrylist[min];
  return entrylist[min + 1];


}

historySchema.methods.getPriceChangeBetween = function (from, to) {

  if (!_.isNumber(from))throw new Error('Unknown date');
  to = to || Date.now();

  const fromEntry = findClosestHistoryEntry(this.history, from);
  const toEntry = findClosestHistoryEntry(this.history, to);

  return toEntry.price / fromEntry.price;

};

historySchema.methods.pruneHistory = function () {

  const count = this.history.length;
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  const startOfToday = moment(new Date()).hour(0).minute(0).seconds(0).milliseconds(0).valueOf();
  const firstSixHour = Math.round(this.history[0].timestamp / SIX_HOURS) * SIX_HOURS;
  for (let time = firstSixHour; time <= startOfToday; time += SIX_HOURS) {
    const closest = findClosestHistoryEntry(this.history, time);
    closest.persist = true;
  }
  const newHistory =  _.filter(this.history, (entry) => entry.persist || entry.timestamp >= startOfToday);
  const newcount = newHistory.length;

  if (newcount !== count)console.log(`Pruned ${this.symbol}-${this.denomination}: ${count} -> ${newcount}`);

  return this.update({
    $set: {
      history: newHistory
    }
  }).exec();

  // Iterate all history before today. Mark all closest to 6 hour marks as persist=true
  // Delete all persist false before today

};

historySchema.statics.pruneHistories = function () {
  return this.find().exec()
      .then((histories) => _.each(histories, (history) => history.pruneHistory()));
};

historySchema.statics.addToHistory = function (values) {

  const {symbol, denomination, historyEntry} = values;

  return this.findOne({symbol: symbol, denomination: denomination}).exec()
      .then((history) => {
        if (history && history.lastTimestamp >= historyEntry.timestamp)
            return Promise.resolve('Already updated for this timestamp');

        return history;
      })
      .then(() => {

        return this.update(
            {
              symbol: symbol,
              denomination: denomination
            },
            {
              $setOnInsert: {
                symbol: symbol,
                denomination: denomination
              },
              $set: {
                lastTimestamp: historyEntry.timestamp
              },
              $push: {
                history: {
                  $each: [ historyEntry ],
                  $sort: { timestamp: 1 }
                }
              }
            },
            {
              upsert: true,
              runValidators: true,
              setDefaultsOnInsert: true
            }
        ).exec()
      })
      .catch((err) => console.warn(`Did not update ${symbol}${denomination} (${err})`));

};

const History = mongoose.model('History', historySchema);

export {
  History,
  historySchema
};

export default History;