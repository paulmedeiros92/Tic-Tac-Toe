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
    return {x: x + this.directions[direction].x, y: y + this.directions[direction].y}
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
    if (x < 1 || x > 3 || y < 1 || y > 3){
      throw new Error('Position value out of bounds!');
    } else if (this.board[y-1][x-1] !== 'U') {
      throw new Error('Position already taken');
    }
    this.board[y-1][x-1] = symbol;
  }

  checkForWinner = function(symbol) {
    let hasFoundWin = false;
    for (let i = 0; i < this.referencePositions.length; i++){
      let coordinate = this.referencePositions[i];
      hasFoundWin = coordinate.directions.some((direction) => this.checkDirection(coordinate.x, coordinate.y, direction, symbol));
      if (hasFoundWin){
        break;
      }
    }
    return hasFoundWin;
  }

  checkForTie = function() {
    return this.board.every((col) => col.every((cell) => cell === 'X' || cell === 'O'));
  }

  checkDirection = function(x, y, direction, symbol) {
    if (x < this.rowMax && y < this.colMax && this.board[y][x] === symbol) {
      const directionModel = new Direction();
      const newCoords = directionModel.moveInDirection(x, y, direction);
      if (newCoords.x === this.rowMax || newCoords.y === this.colMax) {
        return true;
      } else {
        return  true && this.checkDirection(newCoords.x, newCoords.y, direction, symbol);
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
      this.rl.question(`What x,y position would '${this.symbol}' like to play?`, (coordString) => {
        try {
          let coordinates = coordString.split(',').map((strNumber) => parseInt(strNumber));
          board.makeMove(this.symbol, coordinates[0], coordinates[11,1]);
          this.printBoard(board);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  playAgain = function() {
    return new Promise((resolve, reject) => {
      this.re.question('Would you like to play again? (Y/N)', (answer) => {
        if (answer.toLowerCase() === 'y') {
          resolve(true);
        } else if (answer.toLowerCase() === 'n') {
          resolve(false)
        } else {
          reject(new Error('Invalid answer!'))
        }
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
    this.hasWinner = false;
    this.hasTie = false;
  }

  gameLoop = async function() {
    this.playerTurn.printBoard(this.board);
    while(!this.hasWinner && !this.hasTie) {
      try {
        await this.playerTurn.playTurn(this.board);
        this.hasWinner = this.board.checkForWinner(this.playerTurn.symbol);
        this.hasTie = this.board.checkForTie();
        if (!this.hasWinner) {
          this.playerTurn = this.playerTurn === this.player1 ? this.player2 : this.player1;
        }
      } catch (error) {
        console.log(`ERROR: ${error.message}`);
        console.log(this.playerTurn.symbol + " please go again!");
      }
    }
    if (this.hasWinner) {
      console.log(this.playerTurn.symbol + " has won!");      
    } else {
      console.log('Tie!');
    }
  }
}

const game = new Game();

game.gameLoop();
