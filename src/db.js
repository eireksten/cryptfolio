import mongoose from 'mongoose';

let db = null;

export function connect() {

  mongoose.connect('mongodb://localhost/crypto_portfolio');
  db = mongoose.connection;

  return new Promise(function (resolve, reject) {
    db.on('error', reject.bind(null, 'connection_error'));
    db.once('open', resolve);
  });
}

export function disconnect() {
  db && db.disconnect()
}


