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

- ```exit``` or ```quit``` exits this app.
- ```display``` displays your current portfolio data.
- ```set <symbol> <amount>``` sets the amount of the coin ```<symbol>``` in your portfolio to ```<amount>```.
- ```add <symbol> <amount>``` adds ```<amount>``` of the coin ```<symbol>``` to your portfolio.
- ```remove <symbol> <amount>``` removes ```<amount>``` of the coin ```<symbol>``` from your portfolio.
- ```help``` displays the available commands.
