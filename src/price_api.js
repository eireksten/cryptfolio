import request from 'request';

export function getPricingData() {

  return new Promise(function (resolve, reject) {
    request('https://api.coinmarketcap.com/v1/ticker/?convert=EUR&limit=200', function (error, response, body) {

      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(body));
      }

    });
  });

}