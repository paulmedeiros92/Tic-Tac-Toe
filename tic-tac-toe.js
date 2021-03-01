const readline = require("readline");

class Direction {
  constructor() {
    this.directions = {
      N: { x: 0, y:-1},
      NE: {x: 1, y:-1},
      E: {x: 1, y: 0},
      SE: {x: 1, y: 1},
      S: {x: 0, y: 1},
      SW: {x: -1, y: 1},
      W: {x: -1, y: 0},
      NW: {x: -1, y: -1},
    };
  }

  moveInDirection = function(x, y, direction) {
    return {x: x + this.directions[direction], y: y + this.directions[direction]}
  }

}


class Board {
  constructor(x, y) {
    this.board = new Array(y).fill('U').map(() => new Array(x).fill('U'));
    this.directionModel = new Direction();
    this.rowMax = y;
    this.colMax = x;
    this.referencePositions = [
      {x: 0, y: 0, directions: ['E', 'SE', 'S'] },
      {x: 1, y: 0, directions: ['S'] },
      {x: 2, y: 0, directions: ['S','SW'] },
      {x: 0, y: 1, directions: ['E'] },
      {x: 0, y: 2, directions: ['E'] }
    ]
  }

  makeMove = function(symbol, x, y) {
    // check if x or y are out of bounds and throw error if they are
    this.board[x-1][y-1] = symbol;
  }

  checkForWinner = function(symbol) {
    this.referencePositions.forEach((coordinate) => {
      // check for each reference position direction
      coordinate.directions.forEach((direction) => {
        this.checkDirection(coordinate.x, coordinate.y, direction, symbol)
      });
      // if a winning row is found then break and return otherwise continue until end
    });
  }

  checkDirection = function(x, y, direction, symbol) {
    if (x < this.rowMax && y < this.colMax && this.board[x][y] === symbol) {
      if (x === this.rowMax && y === this.colMax) {
        return true;
      } else {
        const direction = new Direction();
        const newCoords = direction.moveInDirection(x, y, direction);
        return  true && checkDirection(newCoords.x, newCoords.y, direction, symbol);
      }
    } else {
      return false;
    }
  }
}

class Player {
  constructor(symbol) {
    this.symbol = symbol;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });
  }

  playTurn = function(board) {
    return new Promise((resolve, reject) => {
      this.rl.question("What x,y position would you like to play?", (coordString) => {
        let coordinates = coordString.split(',').map((strNumber) => parseInt(strNumber));
        board.makeMove(this.symbol, coordinates[0], coordinates[11,1]);
        this.printBoard(board);
        resolve();
      });
    });
  }

  printBoard = function(board) {
    console.log('_______');
    board.board.forEach((row) => {
      let line = '|';
      row.forEach((symbol) => line += symbol + '|');
      console.log(line);
      console.log('_______');
    });
  }
}

class Game {
  constructor() {
    this.board = new Board(3,3);
    this.player1 = new Player('X');
    this.player2 = new Player('O');
    this.playerTurn = this.player1;
    this.hasWinner = null;
  }

  gameLoop = async function() {
    while(this.hasWinner === null) {
      try {
        await this.playerTurn.playTurn(this.board);
        this.hasWinner = this.board.checkForWinner();
        if (!this.hasWinner) {
          this.playerTurn = this.playerTurn === this.player1 ? this.player2 : this.player1;
        }
      } catch (error) {
        console.log(error);
        console.log(this.playerTurn.symbol + " please go again!");
      }
    }
    console.log(this.playerTurn.symbol + " has won!");
  }
}

const game = new Game();

game.gameLoop();
