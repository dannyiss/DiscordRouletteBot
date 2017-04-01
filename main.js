/*
 * RouletteBot - Main file
 *
 * Contributed by:
 * dannyiss
 *
 * Licensed under MIT. Copyright (c) 2017 dannyiss
 */
var Discord = require('discord.js');
var stats = require("stats-lite");
var fs = require('fs');
var csv = require('fast-csv');
var encryptor = require('file-encryptor');
var conf = require("./config.js");
var board = require("./board.js");
var game = require("./game.js");
var chart = require('chart');
var client = new Discord.Client({
    forceFetchUsers: true
});

//These are used to handle which channel to send the messages to and the voice & users in the server
var voice_handler = null;
var voice_connection;
var voice_channel;
var text_channel;
var users;
var globalBoardMessage = null;

//Save to file all of the Player Data
function savePlayers() {
    var csvStream = csv.createWriteStream({headers: false}),
    writableStream = fs.createWriteStream(conf.fileNamePlayers);
      writableStream.on("finish", function(){
        encryptor.encryptFile(conf.fileNamePlayers, conf.encryptedPlayers, conf.encryptionKey, function(err) {
            // Encryption complete.
            if (err) {
                return console.log(err);
            } else {
                console.log('Players Saved & Players Encrypted');
            }
        });
      });
    csvStream.pipe(writableStream);
    game.playersBank.forEach(function(player){
        csvStream.write(player);
    });
    csvStream.end();
}

//Save to file all of the History Data
function saveHistory() {
    var csvStream = csv.createWriteStream({headers: false}),
      writableStream = fs.createWriteStream(conf.fileNameHistory);
      writableStream.on("finish", function(){
        encryptor.encryptFile(conf.fileNameHistory, conf.encryptedHistory, conf.encryptionKey, function(err) {
            // Encryption complete.
            if (err) {
                return console.log(err);
            } else {
                console.log('History Saved & History Encrypted');
            }
        });
      });
    csvStream.pipe(writableStream);
    game.pickedNumbers.forEach(function(number){
        csvStream.write(number);
    });
    csvStream.end();
}

//Prints out the results for the last game played with unique users
function gameResults() {
    var send = "```\nPlayer       | Balance   | Profit\n====================================\n";
    var toSend;
    var playersFromHand = [];
    game.bets.forEach(function(bet) {
        playersFromHand.push(bet.player);
    });
    playersFromHand = playersFromHand.filter((x, i, a) => a.indexOf(x) == i);
    playersFromHand.forEach(function(player) {
        var indexOf = getIndex(player.id);
        var profit = (parseInt(game.playersBank[indexOf].bank) - parseInt(game.playersBank[indexOf].previousBank));

        toSend = game.playersBank[indexOf].name + " " + game.playersBank[indexOf].symbol;
        while (toSend.length < 13) {
            toSend += " ";
        }
        toSend += "|$" + game.playersBank[indexOf].bank;
        while (toSend.length < 25) {
            toSend += " ";
        }
        toSend += "|$" + profit + "\n";
        send += toSend;

        //Handle all the stats
        if (parseInt(game.playersBank[indexOf].bank) > parseInt(game.playersBank[indexOf].highestBank)) {
            game.playersBank[indexOf].highestBank = game.playersBank[indexOf].bank;
        } else if (parseInt(game.playersBank[indexOf].bank) < parseInt(game.playersBank[indexOf].lowestBank)) {
            game.playersBank[indexOf].lowestBank = game.playersBank[indexOf].bank;
        }
        //Update Player Statistics
        if (profit > parseInt(game.playersBank[indexOf].biggestWin)) {
            game.playersBank[indexOf].biggestWin = profit;
        } else if (profit < parseInt(game.playersBank[indexOf].biggestLoss)) {
            game.playersBank[indexOf].biggestLoss = profit;
        }
        if (profit > 0) {
            game.playersBank[indexOf].wins = parseInt(game.playersBank[indexOf].wins) + 1;
        } else if (profit < 0) {
            game.playersBank[indexOf].losses = parseInt(game.playersBank[indexOf].losses) + 1;
        }

        //This is the payback method to handle the paybacks.
        if (parseInt(game.playersBank[indexOf].numberOfLoans) > 0) {
            if (parseInt(game.playersBank[indexOf].bank) >= 2 * (parseInt(game.playersBank[indexOf].numberOfLoans) * conf.loanAmount)) {
                game.playersBank[indexOf].bank = parseInt(game.playersBank[indexOf].bank) - ((parseInt(game.playersBank[indexOf].numberOfLoans) * conf.loanAmount));
                game.playersBank[indexOf].numberOfLoans = 0;
                text_channel.sendMessage("Thank You " + game.playersBank[indexOf].name + " for paying back your debts!");
            }
        }
    });
    text_channel.sendMessage(send + "```");
}

//Prints the board
function printBoard() {
    game.bets.forEach(function(bet) {
        var indexOfTop = game.idMapTop.indexOf(parseInt(bet.type));
        var indexOfMid = game.idMapMid.indexOf(parseInt(bet.type));
        var indexOfBot = game.idMapBot.indexOf(parseInt(bet.type));

        var symbolToUse = getPlayer(bet.player.id);

        if (bet.type == "red" && game.redCount.number < 30 && game.redCount.symbols.indexOf(symbolToUse[0].symbol) == -1) {
            game.redCount.number += 1;
            game.redCount.symbols += symbolToUse[0].symbol;
            board.boardRow20 = board.boardRow20.substring(0, game.redCount.number - 1) + symbolToUse[0].symbol + board.boardRow20.substring(game.redCount.number);
        } else if (bet.type == "black" && game.blackCount.number < 40 && game.blackCount.symbols.indexOf(symbolToUse[0].symbol) == -1) {
            game.blackCount.number += 1;
            game.blackCount.symbols += symbolToUse[0].symbol;
            board.boardRow20 = board.boardRow20.substring(0, game.blackCount.number - 1) + symbolToUse[0].symbol + board.boardRow20.substring(game.blackCount.number);
        } else if (bet.type == "odd" && game.oddCount.number < 50 && game.oddCount.symbols.indexOf(symbolToUse[0].symbol) == -1) {
            game.oddCount.number += 1;
            game.oddCount.symbols += symbolToUse[0].symbol;
            board.boardRow20 = board.boardRow20.substring(0, game.oddCount.number - 1) + symbolToUse[0].symbol + board.boardRow20.substring(game.oddCount.number);
        } else if (bet.type == "even" && game.evenCount.number < 20 && game.evenCount.symbols.indexOf(symbolToUse[0].symbol) == -1) {
            game.evenCount.number += 1;
            game.evenCount.symbols += symbolToUse[0].symbol;
            board.boardRow20 = board.boardRow20.substring(0, game.evenCount.number - 1) + symbolToUse[0].symbol + board.boardRow20.substring(game.evenCount.number);
        } else if (bet.type == "top" && game.topCount.number < 69 && game.topCount.symbols.indexOf(symbolToUse[0].symbol) == -1) {
            game.topCount.number += 1;
            game.topCount.symbols += symbolToUse[0].symbol;
            board.boardRow4 = board.boardRow4.substring(0, game.topCount.number - 1) + symbolToUse[0].symbol + board.boardRow4.substring(game.topCount.number);
        } else if (bet.type == "mid" && game.midCount.number < 69 && game.midCount.symbols.indexOf(symbolToUse[0].symbol) == -1) {
            game.midCount.number += 1;
            game.midCount.symbols += symbolToUse[0].symbol;
            board.boardRow8 = board.boardRow8.substring(0, game.midCount.number - 1) + symbolToUse[0].symbol + board.boardRow8.substring(game.midCount.number);
        } else if (bet.type == "bot" && game.botCount.number < 69 && game.botCount.symbols.indexOf(symbolToUse[0].symbol) == -1) {
            game.botCount.number += 1;
            game.botCount.symbols += symbolToUse[0].symbol;
            board.boardRow12 = board.boardRow12.substring(0, game.botCount.number - 1) + symbolToUse[0].symbol + board.boardRow12.substring(game.botCount.number);
        } else if (bet.type === "1st") {
            if (game.firstCount.number < 23 && game.firstCount.symbols.indexOf(symbolToUse[0].symbol) == -1) {
                game.firstCount.number += 1;
                game.firstCount.symbols += symbolToUse[0].symbol;
                board.boardRow16 = board.boardRow16.substring(0, game.firstCount.number - 1) + symbolToUse[0].symbol + board.boardRow16.substring(game.firstCount.number);
            }
        } else if (bet.type === "2nd") {
            if (game.secondCount.number < 43 && game.secondCount.symbols.indexOf(symbolToUse[0].symbol) == -1) {
                game.secondCount.number += 1;
                game.secondCount.symbols += symbolToUse[0].symbol;
                board.boardRow16 = board.boardRow16.substring(0, game.secondCount.number - 1) + symbolToUse[0].symbol + board.boardRow16.substring(game.secondCount.number);
            }
        } else if (bet.type === "3rd") {
            if (game.thirdCount.number < 63 && game.thirdCount.symbols.indexOf(symbolToUse[0].symbol) == -1) {
                game.thirdCount.number += 1;
                game.thirdCount.symbols += symbolToUse[0].symbol;
                board.boardRow16 = board.boardRow16.substring(0, game.thirdCount.number - 1) + symbolToUse[0].symbol + board.boardRow16.substring(game.thirdCount.number);
            }
        } else if (bet.type === "1-18") {
            if (game.lowCount.number < 11 && game.lowCount.symbols.indexOf(symbolToUse[0].symbol) == -1) {
                game.lowCount.number += 1;
                game.lowCount.symbols += symbolToUse[0].symbol;
                board.boardRow20 = board.boardRow20.substring(0, game.lowCount.number - 1) + symbolToUse[0].symbol + board.boardRow20.substring(game.lowCount.number);
            }
        } else if (bet.type === "19-36") {
            if (game.highCount.number < 61 && game.highCount.symbols.indexOf(symbolToUse[0].symbol) == -1) {
                game.highCount.number += 1;
                game.highCount.symbols += symbolToUse[0].symbol;
                board.boardRow20 = board.boardRow20.substring(0, game.highCount.number - 1) + symbolToUse[0].symbol + board.boardRow20.substring(game.highCount.number);
            }
        } else if (indexOfTop > -1 && game.topRow[indexOfTop].count < 4) {
          if(game.topRow[indexOfTop].symbols.indexOf(symbolToUse[0].symbol) == -1)
          {
            var indexPut = parseInt(bet.type) + game.topRow[indexOfTop].count + ((indexOfTop + 1) * 2) - 1;
            game.topRow[indexOfTop].count += 1;
            game.topRow[indexOfTop].symbols += symbolToUse[0].symbol;
            board.boardRow4 = board.boardRow4.substring(0, indexPut) + symbolToUse[0].symbol + board.boardRow4.substring(indexPut + 1);
          }
        } else if (indexOfMid > -1 && game.middleRow[indexOfMid].count < 4) {
          if(game.middleRow[indexOfMid].symbols.indexOf(symbolToUse[0].symbol) == -1)
          {
            var indexPut = parseInt(bet.type) + game.middleRow[indexOfMid].count + ((indexOfMid + 1) * 2);
            game.middleRow[indexOfMid].count += 1;
            game.middleRow[indexOfMid].symbols += symbolToUse[0].symbol;
            board.boardRow8 = board.boardRow8.substring(0, indexPut) + symbolToUse[0].symbol + board.boardRow8.substring(indexPut + 1);
          }
        } else if (indexOfBot > -1 && game.bottomRow[indexOfBot].count < 4) {
          if(game.bottomRow[indexOfBot].symbols.indexOf(symbolToUse[0].symbol) == -1)
          {
            var indexPut = parseInt(bet.type) + game.bottomRow[indexOfBot].count + ((indexOfBot + 1) * 2) + 1;
            game.bottomRow[indexOfBot].count += 1;
            game.bottomRow[indexOfBot].symbols += symbolToUse[0].symbol;
            board.boardRow12 = board.boardRow12.substring(0, indexPut) + symbolToUse[0].symbol + board.boardRow12.substring(indexPut + 1);
          }
        } else if (parseInt(bet.type) === 0 && game.zeroCount.number < 3) {
          if(game.zeroCount.symbols.indexOf(symbolToUse[0].symbol) == -1)
          {
            game.zeroCount.number += 1;
            game.zeroCount.symbols += symbolToUse[0].symbol;
            board.boardRow8 = board.boardRow8.substring(0, game.zeroCount.number - 1) + symbolToUse[0].symbol + board.boardRow8.substring(game.zeroCount.number);
          }
        }
    });
    text_channel.sendMessage(board.boardRow + board.boardRow1 + board.boardRow2 + board.boardRow3 + board.boardRow4 + board.boardRow5 + board.boardRow6 + board.boardRow7 + board.boardRow8 + board.boardRow9 + board.boardRow10 + board.boardRow11 + board.boardRow12 + board.boardRow13 + board.boardRow14 + board.boardRow15 +
        board.boardRow16 + board.boardRow17 + board.boardRow18 + board.boardRow19 + board.boardRow20 + board.boardRow21 + board.boardRowFinal).then(message => globalBoardMessage = message).catch(console.error);
    if (globalBoardMessage !== null) {
        globalBoardMessage.delete().then(msg => console.log('Board Updated')).catch(console.error);
    }
}

function startBetting() {
    if (game.timeLimit == 1) {
        text_channel.sendMessage(game.timeLimit + " Second Remaining, Place Your Bets!");
        game.timeLimit = game.timeLimit - 1;
    } else if (game.timeLimit == 25) {
        printBoard();
        resetRows();
        game.timeLimit = game.timeLimit - 1;
    } else if (game.timeLimit == 20 || game.timeLimit == 10) {
        printBoard();
        resetRows();
        text_channel.sendMessage(game.timeLimit + " Seconds Remaining, Place Your Bets!");
        game.timeLimit = game.timeLimit - 1;
    } else {
        game.timeLimit = game.timeLimit - 1;
    }
}


//This resets all of the counters in the dictionary for the rows and the other elements
function resetRows() {
    for (var i = 0; i < game.topRow.length; i++) {
        game.topRow[i].count = 0;
        game.middleRow[i].count = 0;
        game.bottomRow[i].count = 0;
    }
    game.zeroCount.number = 1, game.redCount.number = 24, game.blackCount.number = 34, game.evenCount.number = 14, game.oddCount.number = 44, game.lowCount.number = 4, game.highCount.number = 54, game.topCount.number = 65, game.midCount.number = 65,
    game.botCount.number = 65, game.firstCount.number = 4,game.secondCount.number = 24, game.thirdCount.number = 44;
    globalBoardMessage = null;
}

//This resets the board ready to be re-started with the new values.
function resetBoard() {
    game.timeLimit = conf.timeLimit;
    game.bets = [];
    game.gameOn = false;
    game.boardOn = false;
    game.betsClose = false;
    resetRows();
    board.boardRow4 = "|  |    |    |    |    |    |    |    |    |    |    |    |    ||     |\n";
    board.boardRow8 = "|  |    |    |    |    |    |    |    |    |    |    |    |    ||     |\n";
    board.boardRow12 = "|  |    |    |    |    |    |    |    |    |    |    |    |    ||     |\n";
    board.boardRow20 = "   |         |         |         |         |         |         |\n";
    board.boardRow16 = "   |                   |                   |                   |\n";
    //At the end of each game, player stats & history is saved into an encrypted file
    savePlayers();
    saveHistory();
}

//Function responsible for taking the money out of the balance and filtering out bad game.bets!
function takeMoney() {
    var validBets = [];
    game.playersBank.forEach(function(player) {
        player.previousBank = player.bank;
    });
    game.bets.forEach(function(bet) {
        var amount = bet.amount;
        var indexOf = getIndex(bet.player.id);
        var tempCheck = game.playersBank[indexOf].bank - amount;
        if (tempCheck > -1) {
            game.playersBank[indexOf].bank = tempCheck;
            game.playersBank[indexOf].totalBets = parseInt(game.playersBank[indexOf].totalBets) + 1;
            validBets.push(bet);
        } else {
            text_channel.sendMessage(bet.player.username + " your last bet(s) took you over your balance, therefore were not counted.");
        }
    });
    game.bets = validBets;
}

function getNumber() {
    clearInterval(game.timer);
    game.betsClose = true;
    takeMoney();
    printBoard();
    text_channel.sendMessage("No More Bets....\nWinning #");

    var tempNum = Math.floor((Math.random() * 36));
    if (tempNum === 0) {
        game.pickedNum = {
            type: "green",
            number: 0
        };

        text_channel.sendMessage("0 - Green", {
            tts: true
        });
    } else if (game.reds.indexOf(tempNum) > -1) {
        game.pickedNum = {
            type: "red",
            number: tempNum
        };
        text_channel.sendMessage(tempNum + " - Red", {
            tts: true
        });
    } else if (game.blacks.indexOf(tempNum) > -1) {
        game.pickedNum = {
            type: "black",
            number: tempNum
        };
        text_channel.sendMessage(tempNum + " - Black", {
            tts: true
        });
    }
    game.numberLanding[parseInt(game.pickedNum.number)] += 1;
    game.pickedNumbers.push(game.pickedNum);
}

//Currently Leaderboard is Depreceted for now, will do later
function leaderBoard() {
    var toSend = "";
    game.playersBank.sort(function(a, b) {
        return b.bank - a.bank;
    });
    for (var i = 0; i < 5; i++) {
        var player = game.playersBank[i];
        toSend += player.name + " - $" + player.bank + "\n";
    }
    text_channel.sendMessage(toSend);
}

//Take in the array value of winners for each category and adds to whichever is necessary
function giveMoney(winners) {
    winners.forEach(function(bet) {
        var amount = bet.amount;
        var type = bet.type;
        var indexOf = getIndex(bet.player.id);

        if (type == "red" || type == "black" || type == "odd" || type == "even" || type == "1-18" || type == "19-36") {
            game.playersBank[indexOf].bank += (amount * 2);
        } else if (type == "top" || type == "mid" || type == "bot" || type == "1st" || type == "2nd" || type == "3rd") {
            game.playersBank[indexOf].bank += (amount * 3);
        } else {
            game.playersBank[indexOf].bank += (amount * 36);
        }
    });
}

function payoutWinners() {
    var winners;
    text_channel.sendMessage("Calculating Results....");
    if (game.pickedNum.type == "red") {
        winners = grabWinners("red");
        giveMoney(winners);
    } else
    if (game.pickedNum.type == "black") {
        winners = grabWinners("black");
        giveMoney(winners);
    }

    if (parseInt(game.pickedNum.number) % 2 === 0) {
        winners = grabWinners("even");
        giveMoney(winners);
    } else {
        winners = grabWinners("odd");
        giveMoney(winners);
    }

    if (game.idMapTop.indexOf(parseInt(game.pickedNum.number)) > -1) {
        winners = grabWinners("top");
        giveMoney(winners);
    } else if (game.idMapMid.indexOf(parseInt(game.pickedNum.number)) > -1) {
        winners = grabWinners("mid");
        giveMoney(winners);
    } else if (game.idMapBot.indexOf(parseInt(game.pickedNum.number)) > -1) {
        winners = grabWinners("bot");
        giveMoney(winners);
    }
    /*****
    IMPLEMENT THE 1-18, 19-35 && 1st,2nd,3rd
    */
    if (game.pickedNum.number < 19 && game.pickedNum.number > 0) {
        winners = grabWinners("1-18");
        giveMoney(winners);
    } else if (game.pickedNum.number > 18) {
        winners = grabWinners("19-36");
        giveMoney(winners);
    }

    //1st/2nd/3rd
    if (game.pickedNum.number < 13 && game.pickedNum.number > 0) {
        winners = grabWinners("1st");
        giveMoney(winners);
    } else if (game.pickedNum.number < 25 && game.pickedNum.number > 12) {
        winners = grabWinners("2nd");
        giveMoney(winners);
    } else if (game.pickedNum.number > 24) {
        winners = grabWinners("3rd");
        giveMoney(winners);
    }

    //Pay out all Number game.bets
    winners = grabWinners(game.pickedNum.number);
    giveMoney(winners);
    //Print out Game Results & Reset the Game
    gameResults();
    //leaderBoard();
    resetBoard();
}

client.on("disconnect", event => {
    console.log("Disconnected: " + event.reason + " (" + event.code + ")");
});

client.on("serverNewMember", (server, user) => {
    if (createNewUser(user) == 1) {
        text_channel.sendMessage("Welcome " + user.username + " $" + conf.bankRoll + " has been added to your account, good luck! Use $help to learn more");
    }
});

client.on('ready', () => {
    var server = client.guilds.find("name", conf.serverName);
    if (server === null) {
        throw "Couldn't find server";
    }

    text_channel = server.channels.find(chn => chn.name === conf.text_channelName && chn.type === "text");
    if (text_channel === null) {
        throw "Couldn't find text channel: " + conf.text_channelName + " in server";
    }

    voice_channel = server.channels.find(chn => chn.name === conf.voice_channelName && chn.type === "voice");
    if (voice_channel === null) {
        throw "Couldn't find voice channel: " + conf.voice_channelName + " in server";
    }
    users = client.users;

    fs.access(conf.encryptedPlayers, function(err) {
        if (err && err.code === 'ENOENT') {
            createNewFiles();
        } else {
            // Decrypt file for Players & History
            encryptor.decryptFile(conf.encryptedPlayers, 'output_file.csv', conf.encryptionKey, function(err) {
                if (err) {
                    createNewFiles();
                } else {
                    // Decryption complete.
                    csv.fromPath("output_file.csv").on("data", function(data) {
                        var player = {
                            name: data[0],
                            id: data[1],
                            bank: data[2],
                            symbol: data[3],
                            previousBank: data[4],
                            totalBets: data[5],
                            biggestWin: data[6],
                            biggestLoss: data[7],
                            profit: data[8],
                            wins: data[9],
                            losses: data[10],
                            lastBet: data[11],
                            highestBank: data[12],
                            lowestBank: data[13],
                            numberOfLoans: data[14]
                        };
                        game.playersBank.push(player);
                    }).on("end", function() {
                        console.log("Players Decrypted & Loaded");
                    });
                }
            });
        }
    });

    //Checks if the encrypted Data is there otherwise it creates a blank history.
    fs.access(conf.encryptedHistory, function(err) {
        if (err && err.code === 'ENOENT') {
            saveHistory();
        } else {
            encryptor.decryptFile(conf.encryptedHistory, 'output_file_history.csv', conf.encryptionKey, function(err) {
                // Decryption complete.
                if (err) {
                    console.log(err);
                    saveHistory();
                } else {
                    csv.fromPath("output_file_history.csv").on("data", function(data) {
                            var historyNum = {
                                type: data[0],
                                number: data[1]
                            };
                            game.numberLanding[parseInt(historyNum.number)] += 1;
                            game.pickedNumbers.push(historyNum);
                        })
                        .on("end", function() {
                            console.log("History Decrypted & Loaded");
                        });
                }
            });
        }
    });
    //Set Time Limit
    game.timeLimit = conf.timeLimit;

    voice_channel.join().then(connection => {
        voice_connection = connection;
    }).catch(console.error);

    text_channel.sendMessage("Welcome to " + conf.botName + "! $help to learn how to play! Good luck!");
});

client.on('error', (e) => console.error(e));
client.on('warn', (e) => console.warn(e));
client.on('debug', (e) => console.info(e));
client.on('message', message => {
    if (message.content.substring(0, 5).toLowerCase() === conf.prefix + "play" && game.gameOn === false) {
        game.gameOn = true;
        game.boardOn = true;
        game.timer = setInterval(startBetting, 1000);
        setTimeout(getNumber, (conf.timeLimit * 1000) - 5000);
        setTimeout(payoutWinners, conf.timeLimit * 1000);
    } else if (message.content.substring(0, 6).toLowerCase() === conf.prefix + "board") {
        if (game.boardOn === false) {
            printBoard();
            resetRows();
        } else {
            text_channel.sendMessage("Can't print another board until game is over.");
        }
    } else if (message.content.substring(0, 3).toLowerCase() === conf.prefix + "b ") {
        if (game.betsClose === false) {
            var tempPlayer = game.playersBank.filter(function(player) {
                return player.id == message.author.id;
            });
            var betz = message.content.substring(3).split(",");
            betz.forEach(function(bet) {
                var betHandle = bet.split("/");
                var bet = {
                    type: betHandle[0].toLowerCase(),
                    amount: parseInt(betHandle[1]),
                    player: message.author
                };
                if (bet.amount <= (parseInt(tempPlayer[0].bank)/100*conf.maxBet) && bet.amount > 0) {
                    if (bet.type == "red" || bet.type == "black" || bet.type == "even" || bet.type == "odd" || bet.type === "1-18" || bet.type === "19-36" || bet.type == "top" || bet.type == "mid" ||
                        bet.type == "bot" || bet.type === "1st" || bet.type === "2nd" || bet.type === "3rd") {
                        if (bet.amount < conf.minimumBetOutside) {
                            text_channel.sendMessage(bet.type + "/" + bet.amount + " Didn't Meet the Minimum Requirements, Bet Again.");
                        } else {
                            game.bets.push(bet);
                        }
                    } else if (isInt(bet.type)) {
                        if (parseInt(bet.type) < 37 && parseInt(bet.type) > -1) {
                            if (parseInt(bet.amount) < conf.minimumBetInside) {
                                text_channel.sendMessage(bet.type + "/" + bet.amount + " Didn't Meet the Minimum Requirements, Bet Again.");
                            } else {
                                game.bets.push(bet);
                            }
                        } else {
                            text_channel.sendMessage(bet.type + " is not a valid. number(0-36), this bet was not counted.");
                        }
                    } else {
                        text_channel.sendMessage(bet.type + " is not a valid. bet, this bet was not counted.");
                    }
                } else if (bet.amount < 1) {
                    text_channel.sendMessage("Bets can't be negative!");
                } else {
                    text_channel.sendMessage("Max Bet is " + conf.maxBet + "% of your Bank Balance, use $account to check your own balance");
                }
            });

        }
    } else if (message.content.substring(0, 8).toLowerCase() === conf.prefix + "account") {
        var tempPlayer = game.playersBank.filter(function(player) {
            return player.id == message.author.id;
        });
        var toSend = "```\n" + tempPlayer[0].name + "'s Stats\n";
        toSend += "--------------------------------------------\n";
        toSend += "Balance: $" + tempPlayer[0].bank + "\nSymbol: " + tempPlayer[0].symbol + "\nTotal Bets: " + tempPlayer[0].totalBets + "\nBiggest Win: $" + tempPlayer[0].biggestWin + "\nBiggest Loss: $" + tempPlayer[0].biggestLoss + "\nWins: " + tempPlayer[0].wins +
            "\nLosses: " + tempPlayer[0].losses + "\nW/L %: " + (parseInt(tempPlayer[0].wins) / (parseInt(tempPlayer[0].wins) + parseInt(tempPlayer[0].losses)) * 100).toFixed(2) + "%\nRichest: $" + tempPlayer[0].highestBank + "\nPoorest: $" + tempPlayer[0].lowestBank +
            "\nAmount Owing: $" + (parseInt(tempPlayer[0].numberOfLoans) * conf.loanAmount) + "```";
        text_channel.sendMessage(toSend);
    } else if (message.content.substring(0, 5).toLowerCase() === conf.prefix + "loan") {
        var toSend;
        if (game.gameOn === false) {
            var indexOf = getIndex(message.author.id);

            if (parseInt(game.playersBank[indexOf].bank) < parseInt(conf.loanRequirement) && parseInt(game.playersBank[indexOf].numberOfLoans) < parseInt(conf.maxLoans)) {
                game.playersBank[indexOf].bank = parseInt(game.playersBank[indexOf].bank) + conf.loanAmount;
                game.playersBank[indexOf].numberOfLoans = game.playersBank[indexOf].numberOfLoans + 1;
                if (parseInt(game.playersBank[indexOf].bank) - (parseInt(game.playersBank[indexOf].numberOfLoans) * conf.loanAmount) < parseInt(game.playersBank[indexOf].lowestBank)) {
                    game.playersBank[indexOf].bank = parseInt(game.playersBank[indexOf].bank) - (parseInt(game.playersBank[indexOf].numberOfLoans) * conf.loanAmount);
                }
                toSend = "```\n" + game.playersBank[indexOf].name + " Took a $" + conf.loanAmount + " Loan. Enjoy, Payback will occur automatically when your Balance = 2 * Debt!\n```";
            } else {
                toSend = "```You have too much $$ to take out a loan! $" + conf.loanRequirement + "is the minimum balance required for a loan.```";
            }
            text_channel.sendMessage(toSend);
        } else {
            text_channel.sendMessage("Game In Progress, Wait Until It is Over.");
        }
    } else if (message.content.substring(0, 7).toLowerCase() === conf.prefix + "symbol") {
        var duplicateSymbol = false;
        game.playersBank.forEach(function(player) {
            if (message.content.substring(8, 9) === player.symbol) {
                text_channel.sendMessage("Sorry " + message.content.substring(8, 9) + " Symbol has been taken!");
                duplicateSymbol = true;
            }
        });
        if (duplicateSymbol === false) {
            var indexOf = getIndex(message.author.id);
            game.playersBank[indexOf].symbol = message.content.substring(8, 9);
            text_channel.sendMessage("Changed symbol to " + message.content.substring(8, 9));
        }
        savePlayers();
    } else if (message.content.substring(0, 5).toLowerCase() === conf.prefix + "help") {
        text_channel.sendMessage("```To place a bet use the $b [type/number] e.g. $b 10/100 \nTypes of Bets: 0-36(Singular Number), Red, Black, Odd, Even, 1-18, 19-36, 1st, 2nd, 3rd, top(2:1 top row), mid(2:1 middle row), bot(2:1 bottom row) \nUse $account to check your balance and assigned symbol \nUse $symbol [symbol] e.g. $symbol ®.\nUse $loan to get a loan, however there are requirements set by the bot owner.\nUse $history to get statistics from the server about past spins.\nMinimum Inside Bet: $" + conf.minimumBetInside + "\nMinimum Outside Bet: $" + conf.minimumBetOutside + "\nMaximum Bet: " + conf.maxBet + "% of your Balance" + "\nMinimum Loan Balance Requirement: $" + conf.loanRequirement  + "\nLoan Amount: $" + conf.loanAmount + "```");
    } else if (message.content.substring(0, 8).toLowerCase() === conf.prefix + "history") {
        var toSend = "```\nLast Landed Number's & Other Stats\n----------------------------------------\n";
        var numbers = [];
        var countRed = grabNumbers("red").length;
        var countBlack = grabNumbers("black").length;
        var countGreen = grabNumbers("green").length;

        if (game.pickedNumbers.length > 0) {
            game.pickedNumbers = game.pickedNumbers.reverse();
            if (game.pickedNumbers.length < 20) {
                game.pickedNumbers.forEach(function(number) {
                    numbers.push(number.number);
                    toSend += number.number + " " + number.type.capitalize() + "\n";
                });
            } else {
                for (var i = 0; i < 20; i++) {
                    numbers.push(game.pickedNumbers[i].number);
                    toSend += game.pickedNumbers[i].number + " " + game.pickedNumbers[i].type.capitalize() + "\n";
                }
            }

            toSend += "----------------------------------------\n";
            toSend += "Mode: " + stats.mode(numbers) + "\n";
            toSend += "Total Bets: " + game.pickedNumbers.length + "\n";
            toSend += "Red: " + (countRed / game.pickedNumbers.length * 100).toFixed(2) + "%";
            toSend += " Black : " + (countBlack / game.pickedNumbers.length * 100).toFixed(2) + "%";
            toSend += " Green : " + (countGreen / game.pickedNumbers.length * 100).toFixed(2) + "%";
            text_channel.sendMessage(toSend + "```");
            var sendMore = chart(game.numberLanding, {
                width: 85,
                height: 22,
                pointChar: '█',
                negativePointChar: '░'
            });
            var xLabels = "    0   2   4   6   8   10  12  14  16  18  20  22  24  26  28  30  32  34  36";
            var graphTitle = "```                           Number of Times #(0-36) Has Landed";
            text_channel.sendMessage(graphTitle + sendMore + xLabels + "```");
        }
        saveHistory();
    }
});

//Repeating functions below to grab data
function grabWinners(type) {
    return game.bets.filter(function(bet) {
        return bet.type == type;
    });
}

function grabNumbers(type) {
    return game.pickedNumbers.filter(function(numbers) {
        return numbers.type == type;
    });
}

//Gets Player Index at a specificed player ID
function getIndex(value) {
    return game.playersBank.map(function(player) {
        return player.id;
    }).indexOf(value);
}

function getPlayer(value) {
    return game.playersBank.filter(function(player) {
        return player.id == value;
    });
}
//Helper function to test for if the input is an Int
function isInt(value) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}

//Run when there is an error getting the encrptyed file, thus either was modified or non existent.
function createNewFiles() {
    users.forEach(function(element) {
        var player = {
            name: element.username,
            id: element.id,
            bank: conf.bankRoll,
            symbol: conf.userSymbolDefault,
            previousBank: 0,
            totalBets: 0,
            biggestWin: 0,
            biggestLoss: 0,
            profit: 0,
            wins: 0,
            losses: 0,
            lastBet: "",
            highestBank: conf.bankRoll,
            lowestBank: conf.bankRoll,
            numberOfLoans: 0
        };
        game.playersBank.push(player);
    });
    savePlayers();
}

//Returns 1 if it is a new player or returns 0 when the player has been in the server before
function createNewUser(user) {
    if (getIndex(user.id) == -1) {
        var player = {
            name: element.username,
            id: element.id,
            bank: conf.bankRoll,
            symbol: conf.userSymbolDefault,
            previousBank: 0,
            totalBets: 0,
            biggestWin: 0,
            biggestLoss: 0,
            profit: 0,
            wins: 0,
            losses: 0,
            lastBet: "",
            highestBank: conf.bankRoll,
            lowestBank: conf.bankRoll,
            numberOfLoans: 0
        };
        game.playersBank.push(player);
        savePlayers();
        return 1;
    } else {
        text_channel.sendMessage("You have been here before, use your current account & good luck!");
        return 0;
    }
}

//Helper Function to make output better
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

//Handle when using supervisor or other process management
process.on('SIGTERM', function() {
    console.log("Closing Server, Saving Data....");
    voice_connection = null;
    saveHistory();
    savePlayers();
    process.exit(0);
});

//Finally Log the bot into the server
client.login(conf.botToken);
