/*
 * RouletteBot - Config file
 *
 * Contributed by:
 * dannyiss
 *
 * Licensed under MIT. Copyright (c) 2017 dannyiss
 */
var config = {};

//These are the names of bot, prefix for each command & other properties for your server, all fields required.
config.botName = "SwiftRoulette";
config.prefix = "$";
config.serverName = "";
config.text_channelName = "";
config.voice_channelName = "";

//Generate your own encryption key and insert here, DO NOT CHANGE ONCE STARTED
//otherwide data will be "corrupt" and will be overwritten with fresh data.
config.encryptionKey = "";

//These are the names of the files that will store all player/history data, no need to change these
config.fileNamePlayers = "playersBank.csv";
config.encryptedPlayers = "encrypted.dat";
config.fileNameHistory = "bettingHistory.csv";
config.encryptedHistory = "encryptedHistory.dat";

//Insert your Bot Token HERE
config.botToken = "";

//How much money each user gets
config.bankRoll = 1000000;

//The default symbol for new users/non changed symbols
config.userSymbolDefault = "ø";

//Minimum bet Settings for Inside & Outside Bets
config.minimumBetInside = 1000;
config.minimumBetOutside = 10000;

//Max Bet is a % of the users bankroll
config.maxBet = 10;

//Time per Game
config.timeLimit = 25;

//Loan Settings
config.loanAmount = 500000;
config.maxLoans = 5;
//loanRequirement is the number that users have to be down to to be eligible for a loan.
config.loanRequirement = 100000;

module.exports = config;
