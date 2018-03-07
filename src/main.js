import readline from 'readline';

import { displayPortfolio } from './commands.js';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
  switch (input) {
  case 'display':
    displayPortfolio().then(() => rl.prompt());
    break;
  case 'exit':
    rl.close();
    process.exit();
    break;
  default:
    console.log(`Unknown: ${input}`);
  }
});

rl.prompt();