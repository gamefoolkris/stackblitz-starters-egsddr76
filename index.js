
const { feathers } = require("@feathersjs/feathers");
const express = require("@feathersjs/express");
const socketio = require("@feathersjs/socketio");

const app = express(feathers());

app.configure(socketio((io) => {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.emit("exec", `document.getElementById("app").innerHTML = "Connected!"`);

    socket.on("exec", async function(js) {
      let func = new Function("socket", js);
      await func(socket);
    });
  });
}));

app.use(express.static('site'));

app.listen(3030, () => {
  console.log("HTTPS server listening at 3030");
});