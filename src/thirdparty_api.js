import axios from 'axios';

export const getPricingData = () => axios.get('https://api.coinmarketcap.com/v1/ticker/?convert=EUR&limit=200');