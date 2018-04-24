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

const parseGame = (game) => {
  return {
    gameID: game.gameID,
    players: game.players,
    lastMove: game.history[game.history.length - 1],
    currentRound: game.round,
  };
};

io.on('connection', (socket) => {
  socket.game = game;
  console.log(socket.game);

  if (!game.isFull()) {
    io.to(socket.id).emit('assign-player', game.connectPlayer(socket));

    // TODO do this stuff when a game is created.
    if (socket.game.isFull()) {
      socket.game.onTimerEnd(() => {
        socket.game.round += 1;
        sendToGame(socket.game, 'query-for-moves');
      });
      socket.game.setOnTick(() => {
        sendToGame(socket.game, 'update-timer', socket.game.timeRemaining);
      });

      socket.game.startTimer();
    }
  }

  socket.on('submit-move', ({ move, playerColor }) => {
    console.log(move);
    if (socket.game.setMove(playerColor, move).allMovesSet) {
      socket.game.evaluateRound();
      sendToGame(socket.game, 'update', parseGame(socket.game));
    }
  });

  socket.on('disconnect', () => {
    socket.game.disconnectPlayer(socket.color);
    console.log(socket.game);
  });
});
