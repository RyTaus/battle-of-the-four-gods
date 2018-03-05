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

io.on('connection', (socket) => {
  if (!game.isFull()) {
    io.to(socket.id).emit('assignPlayer', game.connectPlayer(socket));
  }
});

io.on('test', (data) => {
  console.log(data);
});
