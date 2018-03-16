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

    this.update(data.game);

    this.selectedActions = [];
    this.timeRemaining = 20;
    this.render();
  }

  update (gameData) {
    this.selectedActions = [];
    this.game = gameData;
    this.timeRemaining = 20;
    // this.timer = setInterval(() => {
    //   this.timeRemaining -= 1;
    //   console.log(this.timeRemaining);
    //   if (this.timeRemaining < 0) {
    //     this.submitMove();
    //     clearInterval(this.timer);
    //   }
    // }, 1000);

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

  render () {
    const wrapper = d3.select('.wrapper');
    wrapper.selectAll('*')
      .remove();

      console.log(this);

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

    wrapper.append('button')
      .text('submit')
      .on('click', () => {
        this.submitMove();
      });
  }
}

Game.MAX_ACTIONS = 3;
Game.TIME_PER_ROUND = 20;


const game = new Game();


socket.on('assign-player', (data) => {
  game.initialize(data);
});

socket.on('update', (data) => {
  game.update(data);
});
