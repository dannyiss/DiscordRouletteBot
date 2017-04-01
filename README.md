# DiscordRouletteBotNode
![Alt text](/images/BoardWithSymbols.png?raw=true "Roulette Board with Bets on the Board")
# Prerequisites
* Basic Knowledge of setting up/running a bot on a Node.js Server.
* NOTE: This bot requires Node 6.x.x or above otherwise it WILL NOT WORK or unexpected results will occur due to this bot relying on things that are present in ES6.
* Bot Token from Discord
* Discord Sever - Set Up with dedicated Roulette Channels for both Voice/Text (The bot uses Text To Speech to say the winning number, so both are REQUIRED).

# Instructions for Installation!
1. Download the Bot
2. Navigate to your file in terminal/cmd
3. Run the command `npm install`
4. Edit the config.js file to your own preferences -- THIS IS A MUST DO, READ FILE AND MAKE SURE ALL FIELDS COMPLETE.
5. Run the command `node main.js`
6. The console should output:
```
Authenticated using token YOUR_TOKEN_HERE
Using gateway wss://gateway.discord.gg/?v=6
Connecting to gateway wss://gateway.discord.gg/?v=6&encoding=json
Connection to gateway opened
Identifying as new session
Sending heartbeat
History Decrypted & Loaded
Players Decrypted & Loaded
Heartbeat acknowledged
```
7. Success! Check your directory there should be some newly created files that are encrypted versions & text versions of the user data, it is not possible to edit the `.csv` files to "cheat".

## Available Commands
1. `$play` - This will initiate and start the game
2. `$account` - Shows the users data
3. `$help` - Lists out all the commands & the minimum & maximum bets
4. `$b type/amount` - Betting command, there is a few parameters here to place a bet.
  * `$b red/1000` - This is to place $1000 on Red. (Red/Black).
  * `$b 10/1000` - This is the command to place $1000 on Number 10 (0-36).
  * `$b 1st/1000` - To place a bet in one of the thirds 1st/2nd/3rd are the compatible ones.
  * `$b top/1000` - To place a bet in one of the rows top/mid/bot are the compatible ones.
  * `$b even/1000` - To place an even/odd bet use this.
  * `$b 1-18/1000` - To place a bet in one of the halves, 1-18/19-36 are the compatible commands.
  * `$b 10/1000,red/1000` - Multiple Bets can be placed in 1 command using `,` to separate the different bets.
5. `$symbol ` - To change a users symbols use this command followed by a single character
  * `$symbol ®` - To change your symbol to ® example.
6. `$history` - This displays the data from the server & an associated graph with the number of times a number has landed.
7. `$board` - Prints out the board for reference & ability to see which bets are currently placed, once a game has commenced this command is disabled to avoid multiple boards and clutter.
8. `$loan` - This is a feature that can be configured in `config.js` to allow when and how much a loan is worth.

## Image Examples
![Alt text](/images/HistoryImage1.png?raw=true "History Stats")
Stores Historical Data of the previous spins
![Alt text](/images/HistoryImage2.png?raw=true "History Graph")
Graph of each number and its number of occurrences.
![Alt text](/images/AccountImage.png?raw=true "Account Stats")
Stores User Data and other tracking elements.

# Licensing
The source code is licensed under the MIT License.

Copyright © 2017 dannyiss.

See LICENSE for full license.
