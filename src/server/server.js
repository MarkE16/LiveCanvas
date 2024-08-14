import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  }
});

let totalConnections = 0;

io.on("connection", socket => {
  totalConnections++;
  console.log("User connected");

  socket.on("canvas-update", (...data) => {
    console.log("websocket received CANVAS_UPDATE: ", data);
    socket.broadcast.emit("canvas-update", ...data);
  });

  socket.on("layer-add", data => {
    console.log("websocket received LAYER_ADD: ", data);
    io.emit("layer-add", data);
  });

  socket.on("layer-remove", data => {
    console.log("websocket received LAYER_REMOVE: ", data);
    io.emit("layer-remove", data);
  });

  socket.on("layer-move", (...data) => {
    console.log("websocket received LAYER_MOVE: ", data);
    io.emit("layer-move", ...data);
  })

  socket.on("disconnect", () => {
    totalConnections--;
    console.log("User disconnected");

    io.emit("totalConnections", totalConnections);
  });

  io.emit("totalConnections", totalConnections);
})

io.listen(8080);