import readline from 'readline';
import _ from 'lodash';

import * as DB from './db.js';
import processCommand, { Commands } from './commands.js';
import MarketPoller from './marketpoller';

// ### CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on('line', (input) => {
  input = input.trim();

  if (input === Commands.EXIT || input === Commands.QUIT) {
    rl.close();
    process.exit();
  } else {
    processCommand(input)
        .then(
            () => rl.prompt(),
            (err) => {
              console.log(`Command '${input}' failed. Error: ${err}`);
              rl.prompt();
            }
        );
  }

});

// ### DB connection
DB.connect().then(
    () => {
      console.log('Connected to MongoDB.');
      rl.prompt();
    },
    () => console.error('Could not connect to database. Verify that a MongoDB instance is running on localhost.')
);
process.on('beforeExit', (code) => {
  DB.disconnect();
  console.log(`Exiting with code ${code}...`);
});

// ### Polling the market
MarketPoller.start();