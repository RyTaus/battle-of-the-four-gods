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
  }

  connectPlayer (socket) {
    const player = this.players[this.connectedPlayers];
    player.assignID(socket);
    this.connectedPlayers += 1;
    return player;
  }

  isFull () {
    return this.connectedPlayers >= 4;
  }

  getPlayer (c) {
    return this.players.filter(p => p.color === c)[0];
  }

  evaluateRound () {
    this.players.forEach((player) => {
      this.evaluatePlayer(player);
    });
    this.players.forEach((player) => {
      player.newRound();
    });
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
        .length;

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
