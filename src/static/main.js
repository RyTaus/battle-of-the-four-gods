const socket = io();


// wrapper.

class Game {
  initialize (player) {
    console.log('initializing...');
    this.player = player;
    this.possibleActions = [
      { action: 'attack', color: 'red' },
      { action: 'defend', color: 'red' },
      { action: 'attack', color: 'blue' },
      { action: 'defend', color: 'blue' },
      { action: 'attack', color: 'green' },
      { action: 'defend', color: 'green' },
      { action: 'attack', color: 'orange' },
      { action: 'defend', color: 'orange' },
    ].filter(a => a.color !== player.color);

    this.setUpScreen();
  }

  setUpScreen () {
    const wrapper = d3.select('.wrapper');
    wrapper.selectAll('button')
      .data(this.possibleActions)
      .enter()
      .append('button')
      .text(d => `${d.action}: ${d.color}`)
      .on('click', (d) => {
        console.log(`${d.action}: ${d.color}`);
      });

    wrapper.selectAll('#player-hp')
      .data([this.player.energy])
      .enter()
      .append('div')
      .attr('id', 'player-hp')
      .text(d => `ENERGY: ${d}`)
      .attr('id', 'player-hp');
  }
}

const game = new Game();


socket.on('assignPlayer', (playerData) => {
  game.initialize(playerData);
});
