
const { feathers } = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

const app = express(feathers());

app.configure(socketio());

app.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.emit('log', 'hi');

  socket.on('log', (data) => {
    console.log(data);
  });
});

app.use(express.static('site'));

app.listen(3030, () => {
  console.log('HTTPS server listening at https://localhost:3030');
});