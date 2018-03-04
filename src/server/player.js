const config = require('./game-config');

class Player {
  constructor (color) {
    this.color = color;
    this.energy = config.START_ENERGY;
  }

  // Move is a list of up to three (type, color) pairss
  setMove (move) {
    this.currentMove = move;
    return this;
  }

  newRound () {
    this.currentMove = null;
    return this;
  }

  isDead () {
    return this.energy <= 0;
  }

  decreaseEnergy (amount) {
    this.energy -= amount;
    return this.isDead();
  }
}

module.exports = Player;
