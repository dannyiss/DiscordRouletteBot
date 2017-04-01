/*
 * RouletteBot - Game file
 *
 * Contributed by:
 * dannyiss
 *
 * Licensed under MIT. Copyright (c) 2017 dannyiss
 */
 
var game = {};
//This boolean makes it so that multiple users cannot start the game
game.gameOn = false;
game.boardOn = false;
game.betsClose = false;
//Stores all the current bets for the current game
game.bets = [];
//Store the Count for each landing Number for the graph
game.numberLanding = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
//Place Holders to check if a number is green/red/black
game.reds = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
game.blacks = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
//Arrays for Each 2 to 1 & for Printing
game.topRow =[{number: 3, count: 0, symbols: ""},{number:6, count: 0, symbols: ""},{number:9, count: 0, symbols: ""},{number:12, count: 0, symbols: ""},{number:15, count: 0, symbols: ""},{number:18, count: 0, symbols: ""} ,{number:21, count: 0, symbols: ""},{number:24, count: 0, symbols: ""},{number:27, count: 0, symbols: ""}
  ,{number:30, count: 0, symbols: ""},{number:33, count: 0, symbols: ""},{number:36, count: 0, symbols: ""}];
game.middleRow =[{number: 2, count: 0, symbols: ""},{number:5, count: 0, symbols: ""},{number:8, count: 0, symbols: ""},{number:11, count: 0, symbols: ""},{number:14, count: 0, symbols: ""},{number:17, count: 0, symbols: ""} ,{number:20, count: 0, symbols: ""},{number:23, count: 0, symbols: ""},{number:26, count: 0, symbols: ""}
  ,{number:29, count: 0, symbols: ""},{number:32, count: 0, symbols: ""},{number:35, count: 0, symbols: ""}];
game.bottomRow =[{number: 1, count: 0, symbols: ""},{number:4, count: 0, symbols: ""},{number:7, count: 0, symbols: ""},{number:10, count: 0, symbols: ""},{number:13, count: 0, symbols: ""},{number:16, count: 0, symbols: ""} ,{number:19, count: 0, symbols: ""},{number:22, count: 0, symbols: ""},{number:25, count: 0, symbols: ""}
  ,{number:28, count: 0, symbols: ""},{number:31, count: 0, symbols: ""},{number:34, count: 0, symbols: ""}];
//Counters used to iterate the position that the board places the users symbol
game.zeroCount = {number: 1, symbols: ""};
game.redCount = {number: 24, symbols: ""};
game.blackCount = {number: 34, symbols: ""};
game.evenCount = {number: 14, symbols: ""};
game.oddCount = {number: 44, symbols: ""};
game.lowCount = {number: 4, symbols: ""};
game.highCount = {number: 54, symbols: ""};
game.topCount = {number: 65, symbols: ""};
game.midCount = {number: 65, symbols: ""};
game.botCount = {number: 65, symbols: ""};
game.firstCount = {number: 4, symbols: ""};
game.secondCount = {number: 24, symbols: ""};
game.thirdCount = {number:44, symbols: ""};

//Timer Properties
game.timer;
game.timeLimit = 0;
//Local storage of the player's bank & the picked numbers.
game.playersBank = [];
game.pickedNumbers = [];
//Default Number is green
game.pickedNum = {
 type: "green",
 number: 0
};
//These are used to map the positions for calculation when inserting into the board
game.idMapTop = game.topRow.map(function(x) {return x.number;});
game.idMapMid = game.middleRow.map(function(x) {return x.number;});
game.idMapBot = game.bottomRow.map(function(x) {return x.number;});

module.exports = game;
