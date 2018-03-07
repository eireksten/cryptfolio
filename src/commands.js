import _ from 'lodash';
import columnify from 'columnify';
import { getPricingData } from './price_api.js';

const holdings = [
    {symbol: 'BTC', amount: 1},
    {symbol: 'ETH', amount: 1},
    {symbol: 'LTC', amount: 1},
    {symbol: 'XMR', amount: 1},
    {symbol: 'XLM', amount: 1},
    {symbol: 'NANO', amount: 1}
];

export function displayPortfolio() {
  return getPricingData().then(function (data) {

    const mycoins = _.filter(data, (item) => !!_.find(holdings, {symbol: item.symbol}));
    const table = _.map(mycoins, (coin) => {
      const coindata = _.pick(coin, ['rank', 'symbol', 'name', 'price_btc']);
      coindata.btc_marketcap = coin.price_btc * coin.available_supply;
      coindata["Current Holdings"] = _.find(holdings, {symbol: coin.symbol}).amount;
      coindata["Current Holdings BTC"] = coindata["Current Holdings"] * coin.price_btc;
      return coindata;
    });

    const sortedTable = _.orderBy(table, ['Current Holdings BTC'], ['desc']);
    const total_value = _.reduce(table, (acc, item) => acc + item['Current Holdings BTC'], 0);
    const btcPriceEur = _.find(data, {symbol: 'BTC'}).price_eur;
    const total_value_eur = btcPriceEur * total_value;

    console.log(columnify(sortedTable));
    console.log();
    console.log(columnify({
        'Current total holdings BTC': total_value,
        'Current BTC price is': btcPriceEur,
        'Current EUR Value': total_value_eur
    }, {
        showHeaders: false
    }));

  });
}

