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

    this.selectedActions = [];

    this.setUpScreen();
  }

  toggleAction (action) {
    // console.log(action);
    if (this.selectedActions.includes(action)) {
      this.selectedActions.splice(this.selectedActions.indexOf(action), 1);
    } else if (this.selectedActions.length < Game.MAX_ACTIONS) {
      this.selectedActions.push(action);
    }
  }

  setUpScreen () {
    const wrapper = d3.select('.wrapper');
    wrapper.selectAll('*').remove();

    wrapper.selectAll('span')
      .data(this.possibleActions)
      .enter()
      .append('span')
      .append('img')
      .attr('src', d => `/static/${d.action}.png`)
      // .text(d => `${d.action}: ${d.color}`)
      .attr('class', d => d.color)
      .classed('selected', d => this.selectedActions.includes(d))
      .classed('action', true)
      .on('click', (d) => {
        this.toggleAction(d);
        console.log(this.selectedActions);
        this.setUpScreen();
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

Game.MAX_ACTIONS = 3;

const game = new Game();


socket.on('assignPlayer', (playerData) => {
  game.initialize(playerData);
});
