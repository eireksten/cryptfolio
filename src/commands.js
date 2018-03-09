import _ from 'lodash';
import columnify from 'columnify';
import { getPricingData } from './price_api.js';
import Holding from './schema/holding.js';

export const Commands = {
  DISPLAY: 'display',
  ADD: 'add',
  REMOVE: 'remove',
  SET: 'set',
  EXIT: 'exit',
  QUIT: 'quit',
  HELP: 'help'
};

function displayPortfolio() {

  return new Promise(function (resolve, reject) {
    Holding.find(function (err, holdings) {
      if (err) {
        reject();
      } else {
        getPricingData()
            .then(function (response) {

              const data = response.data;
              const btc = _.find(data, {symbol: 'BTC'});

              const mycoins = _.filter(data, (item) => !!_.find(holdings, {symbol: item.symbol}));
              const table = _.map(mycoins, (coin) => {
                const coinHoldings = _.find(holdings, {symbol: coin.symbol});
                const coindata = {};
                coindata.rank = coin.rank;
                coindata.symbol = coin.symbol;
                coindata.name = coin.name;
                coindata.holdings = coinHoldings.amount.toFixed(4);
                coindata.btc_price = Number.parseFloat(coin.price_btc).toFixed(8);
                coindata.btc_value = (coinHoldings.amount * coindata.btc_price).toFixed(8);
                coindata.eur_price = Number.parseFloat(coin.price_eur).toFixed(2);
                coindata.eur_value = (coinHoldings.amount * coindata.eur_price).toFixed(2);
                return coindata;
              });

              const sortedTable = _.orderBy(table, ['btc_value'], ['desc']);
              const total_value = _.reduce(table, (acc, item) => acc + parseFloat(item.btc_value), 0);
              const btcPriceEur = btc.price_eur;
              const total_value_eur = btcPriceEur * total_value;

              console.log(columnify(sortedTable, {
                config: {
                  holdings: {
                    align: 'right'
                  },
                  btc_price: {
                    align: 'right'
                  },
                  btc_value: {
                    align: 'right'
                  },
                  eur_price: {
                    align: 'right'
                  },
                  eur_value: {
                    align: 'right'
                  }
                }
              }));
              console.log();
              console.log(columnify({
                'Total value in BTC:': total_value,
                'Current BTC price in EUR:': btcPriceEur,
                'Total value in EUR:': total_value_eur
              }, {
                showHeaders: false
              }));

            })
            .then(
                resolve,
                reject
            );
      }
    });
  });
}

function setCurrency(symbol, amount) {

  return Holding.findOne({symbol: symbol}).exec()
      .then((holding) => {
        if (!holding) {
          return new Holding({
            symbol: symbol,
            amount: amount
          });
        }
        holding.amount = amount;
        return holding;
      })
      .then((holding) => holding.save());
}

function addCurrency(symbol, amount) {

  return Holding.findOne({symbol: symbol}).exec()
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

}

function deleteHolding(symbol) {
  return Holding.findOne({symbol: symbol}).exec()
      .then((holding) => {
        if (!holding)return Promise.reject('Currently not holding this currency.');
        return holding;
      })
      .then((holding) => holding.remove());
}

function removeCurrency(symbol, amount) {

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
    {command: Commands.SET, description: '"set <symbol> <amount>" sets the amount of the coin <symbol> in your portfolio to <amount>.'}
  ]));
  return Promise.resolve();

}

export default function processCommand(input) {

  return new Promise(function (resolve, reject) {

    const args = input.split(' ');

    switch(args[0]) {
    case Commands.DISPLAY:
      displayPortfolio()
          .then(resolve, reject);
      break;
    case Commands.SET:
      setCurrency(args[1], Number.parseFloat(args[2]))
          .then(resolve, reject);
      break;
    case Commands.ADD:
      addCurrency(args[1], Number.parseFloat(args[2]))
          .then(resolve, reject);
      break;
    case Commands.REMOVE:
        if (args.length === 3) {
          removeCurrency(args[1], Number.parseFloat(args[2]))
              .then(resolve, reject);
        } else if (args.length === 2) {
          deleteHolding(args[1]);
        } else {

        }
      break;
    case Commands.HELP:
      displayHelp()
          .then(resolve, reject);
      break;
    default:
      reject();
    }

  });

}
