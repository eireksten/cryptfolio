# Crypto Portfolio

Program to track and display your cryptocurrency portfolio.

This is a work in progress, so the features are VERY limited atm.

## Prerequisites

- Node.js and NPM (https://nodejs.org)
- MongoDB (https://www.mongodb.com)

## Building and running the app

You need to have Node.js and NPM install to build and run this app. To build, run these commands from the base directory:

- Run ```npm install```
- Run ```npm run build```

To start the app:

- Start your mongodb server on localhost by running mongod.exe
- Run ```npm start``` or ```node dist/main.js``` from the base directory.

## Usage

When the app has started successfully, it will say that it has connected to MongoDB and present you with a command line interface. At the moment, the following commands are supported.

It will automatically fetch price data from Binance and GDAX and display this in a table every 5 minutes.

- ```exit``` or ```quit``` exits this app.
- ```display``` displays your current portfolio data.
- ```set-name <symbol> <name> ``` sets the display name for the csoin ```<symbol>```
- ```poll``` fetches the latest data from Binance and GDAX.
- ```set <symbol> <amount>``` sets the amount of the coin ```<symbol>``` in your portfolio to ```<amount>```.
- ```add <symbol> <amount>``` adds ```<amount>``` of the coin ```<symbol>``` to your portfolio.
- ```remove <symbol> <amount>``` removes ```<amount>``` of the coin ```<symbol>``` from your portfolio.
- ```remove <symbol>``` removes and clears the coin ```<symbol>``` from your portfolio.
- ```prune``` Removes all data base entries except the ones that are closest to a 6 hour mark or from today.
- ```help``` displays the available commands.

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
