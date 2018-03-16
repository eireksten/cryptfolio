import axios from 'axios';

export const getPricingData = () => axios.get('https://api.coinmarketcap.com/v1/ticker/?convert=EUR&limit=200');
export const getBinancePrices = () => axios.get('https://api.binance.com/api/v3/ticker/price');
export const getBinanceOrderBookTicker = (symbol) => axios.get(`https://api.binance.com/api/v3/ticker/bookTicker?symbol=${symbol}`);
export const getGDAXTicker = (currency, market) => axios.get(`https://api.gdax.com/products/${currency}-${market}/ticker`);

export default {
  getGDAXTicker,
  getCMCTickerData: getPricingData,
  getBinancePrices: getBinancePrices,
  getBinanceOrderBookTicker: getBinanceOrderBookTicker
}