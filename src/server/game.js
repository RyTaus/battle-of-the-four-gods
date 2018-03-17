const color = require('./color');
const action = require('./action');
const config = require('./game-config');


const Player = require('./player.js');


class Game {
  constructor () {
    this.gameID = Game.generateNewId.next().value;
    // 4 players
    this.players = Object.keys(color).map(c => new Player(c));

    this.neededPlayers = Object.keys(color);
    this.connectedPlayers = [];
    this.movesSet = new Set([]);
    this.timeRemaining = config.TIME_PER_ROUND;
  }

  connectPlayer (socket) {
    if (!this.isFull()) {
      const newColor = this.neededPlayers.pop();
      const player = this.getPlayer(newColor);
      player.assignID(socket);
      socket.color = newColor;
      this.connectedPlayers.push(newColor);
      return { player, game: this };
    }
    return null;
  }

  onTimerEnd (fun) {
    this.timerEndFunction = fun;
  }

  setOnTick (fun) {
    this.onTick = fun;
  }

  disconnectPlayer (c) {
    this.connectedPlayers.splice(this.connectedPlayers.indexOf(c), 1);
    this.neededPlayers.push(c);
  }

  isFull () {
    return this.connectedPlayers.length >= this.players.length;
  }

  getPlayer (c) {
    return this.players.filter(p => p.color === c)[0];
  }

  setMove (c, move) {
    this.getPlayer(c).setMove(move);
    this.movesSet.add(c);
    return { allMovesSet: this.checkIfAllMovesSet() };
  }

  checkIfAllMovesSet () {
    return this.movesSet.size >= this.players.length;
  }

  evaluateRound () {
    this.players.forEach((player) => {
      this.evaluatePlayer(player);
    });
    this.players.forEach((player) => {
      player.newRound();
    });
    this.movesSet = new Set([]);

    this.timeRemaining = config.TIME_PER_ROUND;
    this.startTimer();
  }

  startTimer () {
    console.log('starting timer...');
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeRemaining -= 1;
      this.onTick();
      if (this.timeRemaining < 0) {
        this.timerEndFunction();
        clearInterval(this.timer);
      }
    }, 1000);
    return this;
  }

  evaluatePlayer (player) {
    player.currentMove.forEach((move) => {
      player.decreaseEnergy(1);
      this.evaluateMove(player, move);
    });
  }

  evaluateMove (actingPlayer, move) {
    if (move.action === action.attack) {
      const isDefended = this.getPlayer(move.color)
        .currentMove.filter(m => m.color === actingPlayer.color && m.action === action.defend)
        .length !== 0;

      if (!isDefended) {
        this.getPlayer(move.color).decreaseEnergy(config.ATTACK_DAMAGE);
      }
    }
  }
}

function* idGenerator () {
  let index = 0;
  while (true) {
    yield index;
    index += 1;
  }
}

Game.generateNewId = idGenerator();

module.exports = Game;
