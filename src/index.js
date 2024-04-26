import path from "node:path";
import express from "express";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import { Server } from "socket.io";
import Filter from "bad-words";
import { generateMessage } from "./utils/generate.js";
import { addUser, removeUser, getUser, getUsersInRoom } from "./utils/users.js";

const app = express();
const server = createServer(app);
const socketIO = new Server(server);

const PORT = process.env.PORT || 42069;

const publicDirectoryPath = fileURLToPath(
  path.join(import.meta.url, "../../public")
);

app.use(express.static(publicDirectoryPath));

socketIO.on("connection", (socket) => {
  //add user to a room
  socket.on("join", ({ username, room }, callback) => {
    const result = addUser({ id: socket.id, username, room });
    if (result.error) {
      return callback(result.error);
    }

    socket.join(result.room);
    socket.emit("message", generateMessage("Admin", "Welcome"));
    socket.broadcast.to(result.room)
      .emit(
        "message",
        generateMessage("Admin", `${result.username} has joined!`)
      );
    socketIO.to(result.room).emit("roomData" , {
      room : result.room,
      users: getUsersInRoom(result.room)
    })
  });

  socket.on("sendMessage", (msg, callbackClient) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(msg)) {
      return callbackClient("Profanity is not allowed");
    }
    socketIO.to(user.room)
      .emit("message", generateMessage(user.username, msg));
    callbackClient();
  });

  socket.on("sendLocation", (coords, callbackClient) => {
    const user = getUser(socket.id);
    socketIO
      .to(user.room)
      .emit(
        "locationMessage",
        generateMessage(
          user.username,
          `https://google.com/maps?q=${coords.lat},${coords.long}`
        )
      );
    callbackClient("Location Shared");
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      socketIO.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} just left`)
      );
      socketIO.to(user.room).emit("roomData" , {
        room : user.room,
        users: getUsersInRoom(user.room)
      })
    }
  });
});

server.listen(PORT, () => {
  console.log("Running on port " + PORT);
});
