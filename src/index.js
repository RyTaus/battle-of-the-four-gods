const http = require('http');
const express = require('express');
const path = require('path');

const Game = require('./server/game.js');
// const Player = require('./server/player.js');

const app = express();
const server = http.createServer(app);
const io = require('socket.io').listen(server);

// Route / to that
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '/index.html')));
app.use('/static', express.static(path.join(__dirname, 'static')));

server.listen(3000);


/* Game Logic */
const game = new Game();
const games = {};
games[game.gameID] = game;

/* Socket */

const sendToGame = (g, message, data) => {
  g.players.forEach((player) => {
    io.to(player.id).emit(message, data);
  });
};

io.on('connection', (socket) => {
  socket.game = game;

  if (!game.isFull()) {
    io.to(socket.id).emit('assign-player', game.connectPlayer(socket));
  }

  socket.on('submit-moves', ({ moves, playerColor }) => {
    console.log(moves);
    if (socket.game.setMove(playerColor, moves).allMovesSet) {
      socket.game.evaluateRound();
      sendToGame(socket.game, 'update', game);
    }
  });
});
