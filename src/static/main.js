const socket = io();


// wrapper.

class Game {
  initialize (data) {
    console.log('initializing...');
    this.game = data.game;
    this.player = data.player;
    this.possibleActions = [
      { action: 'attack', color: 'red' },
      { action: 'defend', color: 'red' },
      { action: 'attack', color: 'blue' },
      { action: 'defend', color: 'blue' },
      { action: 'attack', color: 'green' },
      { action: 'defend', color: 'green' },
      { action: 'attack', color: 'orange' },
      { action: 'defend', color: 'orange' },
    ].filter(a => a.color !== this.player.color);

    this.selectedActions = [];

    this.render();
  }

  update (gameData) {
    this.game = gameData;
    this.render();
  }

  toggleAction (action) {
    // console.log(action);
    if (this.selectedActions.includes(action)) {
      this.selectedActions.splice(this.selectedActions.indexOf(action), 1);
    } else if (this.selectedActions.length < Game.MAX_ACTIONS) {
      this.selectedActions.push(action);
    }
  }

  render () {
    const wrapper = d3.select('.wrapper');
    wrapper.selectAll('*').remove();

    wrapper.selectAll('img')
      .data(this.possibleActions)
      .enter()
      .append('img')
      .attr('src', d => `/static/${d.action}.png`)
      .attr('class', d => d.color)
      .classed('selected', d => this.selectedActions.includes(d))
      .classed('action', true)
      .on('click', (d) => {
        this.toggleAction(d);
        this.render();
      });

    wrapper.selectAll('#player-hp')
      .data(this.game.players)
      .enter()
      .append('div')
      .attr('id', 'player-hp')
      .text(d => `Energy: ${d.energy}`)
      .attr('class', d => d.color)
      .classed('life', true);
  }
}

Game.MAX_ACTIONS = 3;

const game = new Game();


socket.on('assign-player', (data) => {
  game.initialize(data);
});

socket.on('update', (data) => {
  game.update(data);
});
