//import moment from 'moment';
import _ from 'lodash';

import ThirdPartyApi from './thirdparty_api.js';
import Holding from './schema/holding.js';
import History from './schema/history.js';
import HistoryEntry from './schema/history_entry.js';
import * as Commands from './commands.js'

const MINUTE = 60000;
const INTERVAL = 5 * MINUTE;

function updateLatestPricingData(timestamp) {

  timestamp = timestamp || Math.round(Date.now() / INTERVAL) * INTERVAL;

  return Promise.all([Holding.find().exec(), ThirdPartyApi.getGDAXTicker('BTC', 'EUR'), ThirdPartyApi.getBinancePrices()])
      .then((values) => {
        const [holdings, {data: btcEurGdax}, {data: binancePrices}] = values;

        return Promise.all(_.concat(
          History.addToHistory({
            symbol: 'BTC',
            denomination: 'EUR',
            historyEntry: new HistoryEntry({
                price: Number.parseFloat(btcEurGdax.price),
                timestamp: timestamp
            })
          }),
          _.map(holdings, (holding) => {

            const ticker = _.find(binancePrices, {symbol: holding.symbol+'BTC'});
            if (ticker) {
              return History.addToHistory({
                symbol: holding.symbol,
                denomination: 'BTC',
                historyEntry: new HistoryEntry({
                  price: Number.parseFloat(ticker.price),
                  timestamp: timestamp
                })
              });
            }
            return Promise.resolve()
          })
        ));
      })
      .then(Commands.displayPortfolio) // TODO Make this event based through main instead!
      .catch((err) => console.log('Problem displaying portfolio', err));

}

function start() {

  // Polling for updates every whole 5 minutes (300 000 ms)
  const time = Date.now();
  updateLatestPricingData(time - (time % INTERVAL));
  setTimeout(function () {
    updateLatestPricingData();
    setInterval(updateLatestPricingData, INTERVAL);
  }, INTERVAL - (Date.now() % INTERVAL));

  // TODO Should prune history data regularly
  // More than 24 hours ago: Keep only every 6 hours
  // More than 7 days ago: Keep only once/day
  // More than one year ago: Keep only once/week



}

export default {
  start,
  poll: updateLatestPricingData
}