const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("start", (playerName) => {
    // prisma add player to db
    // prisma get player from db
    // socket.emit("join", playerData);
    // prisma get all players from db
    // socket.emit("online", playersCount);
  });

  socket.on("move", (dir) => {
    // prisma update player position in db
    // return playerData
    // io.emit("playerMove", playerData);
  });

  socket.on("chat message", (msg) => {});

  socket.on("disconnect", () => {
    // prisma remove player from db
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Socket.io server running on http://localhost:${PORT}`);
});
