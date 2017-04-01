/*
 * RouletteBot - Board file
 *
 * Contributed by:
 * dannyiss
 *
 * Licensed under MIT. Copyright (c) 2017 dannyiss
 */
var board = {};

board.boardRow = "```fix\n";
board.boardRow1 = "  ____________________________________________________________________\n";
board.boardRow2 = " / |    |    |    |    |    |    |    |    |    |    |    |    ||     |\n";
board.boardRow3 = "|  | (3)|  6 | (9)|(12)| 15 |(18)|(21)| 24 |(27)|(30)| 33 |(36)|| 2:1 |\n";
board.boardRow4 = "|  |    |    |    |    |    |    |    |    |    |    |    |    ||     |\n";
board.boardRow5 = "|  |____|____|____|____|____|____|____|____|____|____|____|____||_____|\n";
board.boardRow6 = "|  |    |    |    |    |    |    |    |    |    |    |    |    ||     |\n";
board.boardRow7 = "|0 |  2 | (5)|  8 | 11 |(14)| 17 | 20 |(23)| 26 | 29 |(32)| 35 || 2:1 |\n";
board.boardRow8 = "|  |    |    |    |    |    |    |    |    |    |    |    |    ||     |\n";
board.boardRow9 = "|  |____|____|____|____|____|____|____|____|____|____|____|____||_____|\n";
board.boardRow10= "|  |    |    |    |    |    |    |    |    |    |    |    |    ||     |\n";
board.boardRow11= "|  | (1)|  4 | (7)| 10 | 13 |(16)|(19)| 22 |(25)| 28 | 31 |(34)|| 2:1 |\n";
board.boardRow12= "|  |    |    |    |    |    |    |    |    |    |    |    |    ||     |\n";
board.boardRow13= "\\__|____|____|____|____|____|____|____|____|____|____|____|____||_____|\n";
board.boardRow14= "   |                   |                   |                   |\n";
board.boardRow15= "   |       1st 12      |       2nd 12      |       3rd 12      |\n";
board.boardRow16= "   |                   |                   |                   |\n";
board.boardRow17= "   |___________________|___________________|___________________|\n";
board.boardRow18= "   |         |         |         |         |         |         |\n";
board.boardRow19= "   |  1 - 18 |   Even  |  (Red)  |  Black  |   Odd   | 19 - 36 |\n";
board.boardRow20= "   |         |         |         |         |         |         |\n";
board.boardRow21= "   |_________|_________|_________|_________|_________|_________|\n";
board.boardRowFinal = "```";

module.exports = board;
