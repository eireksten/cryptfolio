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
            .then(function (data) {

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

function addCurrency(symbol, amount) {
  return new Promise(function (resolve, reject) {
    Holding.find({symbol: symbol}, function (err, holdings) {
      if (err)return reject(err);

      if (!holdings.length) {
        const newHolding = new Holding({
          symbol: symbol,
          amount: amount
        });
        newHolding.save(function (err) {
          if (err)return reject(err);
          return resolve();
        });
      } else {
        const holding = holdings[0];
        holding.amount += amount;
        holding.save(function (err) {
          if (err)return reject(err);
          return resolve();
        });
      }

    });
  });
}

function removeCurrency(symbol, amount) {
  return new Promise(function (resolve, reject) {
    Holding.find({symbol: symbol}, function (err, holdings) {
      if (err)
        return reject(err);

      if (!holdings.length)
        return reject('Currently not holding this currency.');

      const holding = holdings[0];
      if (holding.amount < amount)
        return reject('Trying to remove more than holding');

      holding.amount -= amount;
      holding.save(function (err) {
        if (err)
          return reject(err);

        return resolve();
      });


    });
  });
}

function setCurrency(symbol, amount) {
  return new Promise(function (resolve, reject) {
    Holding.find({symbol: symbol}, function (err, holdings) {
      if (err)return reject(err);

      if (!holdings.length) {
        const newHolding = new Holding({
          symbol: symbol,
          amount: amount
        });
        newHolding.save(function (err) {
          if (err)return reject(err);
          return resolve();
        });
      } else {
        const holding = holdings[0];
        holding.amount = amount;
        holding.save(function (err) {
          if (err)return reject(err);
          return resolve();
        });
      }

    });
  });
}

function displayHelp() {

  console.log('The following commands are supported:');
  console.log(columnify([
    {command: Commands.ADD, description: '"Add <symbol> <amount>" adds <amount> of the coin <symbol> to your portfolio.'},
    {command: Commands.DISPLAY, description: 'Displays your current portfolio data.'},
    {command: Commands.EXIT, description: 'Exits the app.'},
    {command: Commands.HELP, description: 'Displays this help.'},
    {command: Commands.QUIT, description: 'Exits the app.'},
    {command: Commands.REMOVE, description: '"Add <symbol> <amount>" removes <amount> of the coin <symbol> from your portfolio.'},
    {command: Commands.SET, description: '"Add <symbol> <amount>" sets the amount of the coin <symbol> in your portfolio to <amount>.'}
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
      removeCurrency(args[1], Number.parseFloat(args[2]))
          .then(resolve, reject);
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
