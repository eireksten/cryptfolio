import _ from 'lodash';
import columnify from 'columnify';
import colors from 'colors';
import beep from 'beepbeep';
import moment from 'moment';

import Holding from './schema/holding.js';
import History from './schema/history.js';
import MarketPoller from './marketpoller.js';

export const Commands = {
  DISPLAY: 'display',
  ADD: 'add',
  REMOVE: 'remove',
  SET: 'set',
  SET_NAME: 'set-name',
  POLL: 'poll',
  PRUNE: 'prune',
  EXIT: 'exit',
  QUIT: 'quit',
  HELP: 'help'
};

export const Time = {
  DAY: 1000 * 60 * 60 * 24,
  HOUR: 1000 * 60 * 60,
  MINUTE: 1000 * 60
};

function createPriceChangeText(delta) {
  if (Number.parseFloat(delta) === 0.00) {
    return '0.00';
  } else if (delta > 7.5) {
    return colors.green.bold('+' + delta);
  } else if (delta < -7.5) {
    return colors.red.bold(delta);
  } else if (delta < 0) {
    return colors.red(delta);
  } else {
    return colors.green('+' + delta);
  }

}

export function displayPortfolio() {

  return Promise.all([
    Holding.find().exec(),
    History.findOne({
      symbol: 'BTC',
      denomination: 'EUR'
    }),
    History.find({
      denomination: 'BTC'
    }).exec()
  ])
      .then((values) => {

        const holdings = values[0];
        const btcEurHistory = values[1];
        const coinBtcHistories = values[2];

        var latestHistoryEntry = btcEurHistory.getLatestHistoryEntry();

        const btcEurPrice = latestHistoryEntry.price;
        const latestTimestamp = latestHistoryEntry.timestamp;
        const startOfToday = moment(new Date()).hour(0).minute(0).seconds(0).milliseconds(0).valueOf();
        const startOfYesterday = startOfToday - Time.DAY;
        const mondayMorning = moment(new Date()).hour(0).minute(0).seconds(0).milliseconds(0).day(1).valueOf();
        const lastMondayMorning = mondayMorning - 7 * Time.DAY;

        let shouldBeep = false;

        const table = _.compact(_.map(holdings, (holding) => {
          const history = _.find(coinBtcHistories, {symbol: holding.symbol});
          if (!history)return null;

          const latestEntry = history.getLatestHistoryEntry();
          if (!latestEntry)return null;


          const deltaHistory = (history.symbol === 'BTC' ? btcEurHistory : history);

          const delta5mins = ((deltaHistory.getPriceChangeBetween(latestTimestamp - 5 * Time.MINUTE, latestTimestamp) - 1) * 100).toFixed(2);
          const deltaToday = ((deltaHistory.getPriceChangeBetween(startOfToday, latestTimestamp) - 1) * 100).toFixed(2);
          const deltaYesterday = ((deltaHistory.getPriceChangeBetween(startOfYesterday, startOfToday) - 1) * 100).toFixed(2);
          const deltaThisWeek = ((deltaHistory.getPriceChangeBetween(mondayMorning, latestTimestamp) - 1) * 100).toFixed(2);
          const deltaLastWeek = ((deltaHistory.getPriceChangeBetween(lastMondayMorning, mondayMorning) - 1) * 100).toFixed(2);

          if (delta5mins >= 2.0) {
            shouldBeep = true;
          }

          const latestPrice = Number.parseFloat(latestEntry.price).toFixed(8);

          const coindata = {};
          coindata.symbol = history.symbol;
          coindata.name = holding.name;
          coindata.holdings = holding.amount.toFixed(4);
          coindata.btc_price = (history.symbol === 'BTC' ? Number.parseFloat(btcEurPrice).toFixed(2) : latestPrice);
          coindata.btc_value = (holding.amount * latestPrice).toFixed(8);
          coindata.five_min = createPriceChangeText(delta5mins);
          coindata.today = createPriceChangeText(deltaToday);
          coindata.yesterday = createPriceChangeText(deltaYesterday);
          coindata.this_week = createPriceChangeText(deltaThisWeek);
          coindata.last_week = createPriceChangeText(deltaLastWeek);
          coindata.eur_price = (btcEurPrice * latestPrice).toFixed(2);
          coindata.eur_value = (holding.amount * btcEurPrice * latestPrice).toFixed(2);
          return coindata;
        }));

        if (shouldBeep) {
          beep(3, 1000);
        }

        const total_value = _.reduce(table, (acc, item) => acc + parseFloat(item.btc_value), 0);
        const total_value_eur = btcEurPrice * total_value;
        const sortedTable = _.concat(
            _.find(table, {symbol: 'BTC'}),
            _.orderBy(
                _.map(
                    _.reject(table, {symbol: 'BTC'}),
                    (coindata) => {
                      coindata.share = `${(100 * coindata.btc_value / total_value).toFixed(2)}%`;
                      return coindata;
                    }
                ),
                ['btc_value'],
                ['desc']
            )
        );

        sortedTable[0].share = `${(100 * sortedTable[0].btc_value / total_value).toFixed(2)}%`;

        sortedTable.push({
          symbol: colors.cyan('TOT'),
          name: colors.cyan('Total Holdings'),
          btc_value: colors.cyan(total_value.toFixed(8)),
          eur_value: colors.cyan(total_value_eur.toFixed(2))
        });

        console.log();
        console.log(columnify(sortedTable, {
          columnSplitter: ' | ',
          headingTransform: function (heading) {
            return colors.yellow(
                _.startCase(heading)
            );
          },
          config: {
            holdings: {
              align: 'right'
            },
            btc_price: {
              align: 'center'
            },
            btc_value: {
              align: 'center'
            },
            five_min: {
              align: 'right'
            },
            today: {
              align: 'right'
            },
            yesterday: {
              align: 'right'
            },
            this_week: {
              align: 'right'
            },
            last_week: {
              align: 'right'
            },
            eur_price: {
              align: 'right'
            },
            eur_value: {
              align: 'right'
            },
            share: {
              align: 'right'
            }
          }
        }));
      });
}

function displayHelp() {

  console.log('The following commands are supported:');
  console.log(columnify([
    {command: Commands.ADD, description: '"add <symbol> <amount>" adds <amount> of the coin <symbol> to your portfolio.'},
    {command: Commands.DISPLAY, description: 'Displays your current portfolio data.'},
    {command: Commands.EXIT, description: 'Exits the app.'},
    {command: Commands.HELP, description: 'Displays this help.'},
    {command: Commands.QUIT, description: 'Exits the app.'},
    {command: Commands.REMOVE, description: '"remove <symbol> <amount>" removes <amount> of the coin <symbol> from your portfolio, while "remove <symbol>" removes the full amount and clears the holding.'},
    {command: Commands.SET, description: '"set <symbol> <amount>" sets the amount of the coin <symbol> in your portfolio to <amount>.'},
    {command: Commands.SET_NAME, description: '"set-name <symbol> <name>" sets the name of the coin <symbol> to name.'},
    {command: Commands.POLL, description: 'Fetches the latest price data from Binance and GDAX and displays the portfolio data.'},
    {command: Commands.PRUNE, description: 'Removes price history entries that are not from today or the closest one to a six hour mark from the database.'}
  ]));
  return Promise.resolve();

}

export default function processCommand(input) {

  const args = input.split(' ');

  switch(args[0]) {
  case Commands.DISPLAY:
    return displayPortfolio();
  case Commands.SET_NAME:
    return Holding.setName(args[1], Array.prototype.slice.call(args, 2).join(' '));
  case Commands.SET:
    return Holding.setCurrency(args[1], Number.parseFloat(args[2]));
  case Commands.ADD:
    return Holding.addCurrency(args[1], Number.parseFloat(args[2]));
  case Commands.REMOVE:
    if (args.length === 3) {
      return Holding.removeCurrency(args[1], Number.parseFloat(args[2]));
    } else if (args.length === 2) {
      return Holding.deleteHolding(args[1]);
    }
    return Promise.reject('Wrong number of arguments.');
  case Commands.POLL:
    return MarketPoller.poll();
  case Commands.PRUNE:
    return History.pruneHistories();
  case Commands.HELP:
    return displayHelp();
  default:
    return Promise.reject();
  }

}
