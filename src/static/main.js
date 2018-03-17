const socket = io();


// wrapper.

class Game {
  initialize (data) {
    console.log('initializing...');
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

    this.enemies = ['red', 'blue', 'green', 'orange'].filter(c => c !== this.player.color);

    this.update(data.game);

    this.selectedActions = [];
    this.timeRemaining = 20;
    this.render();
  }

  getPlayer (color) {
    return this.game.players.filter(player => player.color === color)[0];
  }

  update (gameData) {
    this.selectedActions = [];
    this.game = gameData;

    this.render();
  }

  submitMove () {
    console.log(this.selectedActions);
    socket.emit('submit-move', { playerColor: this.player.color, move: this.selectedActions });

  }

  toggleAction (action) {
    if (this.selectedActions.includes(action)) {
      this.selectedActions.splice(this.selectedActions.indexOf(action), 1);
    } else if (this.selectedActions.length < Game.MAX_ACTIONS) {
      this.selectedActions.push(action);
    }
  }

  renderHealth (appendTo, color) {
    return appendTo.append('div')
      .text(this.getPlayer(color).energy)
      .classed(color, true)
      .classed('health-box', true);
  }

  renderEnemy (color) {
    const playerDetailContainer = d3.select('.wrapper').select('.pdc');

    const container = playerDetailContainer.append('div')
      .classed(`col-sm-${12 / this.enemies.length}`, true)
      .classed('enemy', true);

    this.renderHealth(container, color);

    container.append('div')
      .classed('row', true)
      .selectAll('img')
      .data(this.possibleActions.filter(action => action.color === color))
      .enter()
      .append('img')
      .attr('src', d => `/static/${d.action}.png`)
      .classed('img-responsive', true)
      .classed(color, true)
      .classed('selected', d => this.selectedActions.includes(d))
      .classed('action', true)
      .on('click', (d) => {
        this.toggleAction(d);
        this.render();
      });
  }

  renderTime (timeRemaining) {
    const wrapper = d3.select('.wrapper');

    return wrapper.select('.timer')
      .text(timeRemaining)
      .classed('timer', true)
      .classed('eslint', this.isFalse);
  }

  render () {
    const wrapper = d3.select('.wrapper');
    wrapper.selectAll('*')
      .remove();

    wrapper.append('div')
      .classed('pdc', true)
      .classed('container', true)
      .classed('row', true);

    console.log(this);

    this.enemies.forEach(enemy => this.renderEnemy(enemy));

    const playerInfo = wrapper.append('div')
      .classed('pi', true)
      .classed('container', true)
      .classed('row', true);

    this.renderHealth(playerInfo, this.player.color)
      .classed('container', true)
      .classed('col-sm-4', true);

    wrapper.append('button')
      .text('submit')
      .classed('button', true)
      .on('click', () => {
        this.submitMove();
      });

    wrapper.append('div')
      .classed('timer', true);

    this.renderTime('');
  }
}

Game.MAX_ACTIONS = 3;
Game.TIME_PER_ROUND = 20;


const game = new Game();


socket.on('assign-player', (data) => {
  game.initialize(data);
});

socket.on('query-for-moves', () => {
  game.submitMove();
});

socket.on('update-timer', (timeRemaining) => {
  console.log(timeRemaining);
  game.renderTime(timeRemaining);
});

socket.on('update', (data) => {
  game.update(data);
});
