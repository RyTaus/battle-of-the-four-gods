const color = require('./color');
const action = require('./action');
const config = require('./game-config');


const Player = require('./player.js');


class Game {
  constructor () {
    this.gameID = Game.generateNewId.next().value;
    // 4 players
    this.players = Object.keys(color).map(c => new Player(c));

    this.connectedPlayers = 0;
    this.movesSet = new Set([]);
  }

  connectPlayer (socket) {
    const player = this.players[this.connectedPlayers];
    player.assignID(socket);
    this.connectedPlayers += 1;
    return { player, game: this };
  }

  isFull () {
    return this.connectedPlayers >= this.players.length;
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
    return (this.movesSet.size >= this.players.length);
  }

  evaluateRound () {
    this.players.forEach((player) => {
      this.evaluatePlayer(player);
    });
    this.players.forEach((player) => {
      player.newRound();
    });
    this.movesSet = new Set([]);
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
