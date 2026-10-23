
const { feathers } = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const https = require('https');
const fs = require('fs');

const app = express(feathers());

/*const server = https.createServer({
  cert: fs.readFileSync('cert.pem'),
  key: fs.readFileSync('key.pem'),
}, app);*/

app.configure(socketio());

app.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('message', (data) => {
    socket.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

/*app.get('/', (req, res) => {
  res.send(fs.readFileSync('index.html', 'utf-8'));
});*/

app.use(express.static('site/'));

app.listen(3030, () => {
  console.log('HTTPS server listening on port 3030');
});