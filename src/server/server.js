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

  socket.on("message", message => {
    console.log("server received message: ", message);
  });

  socket.on("CANVAS_UPDATE", data => {
    console.log("server received CANVAS_UPDATE: ", data);
    io.emit("CANVAS_UPDATE", data);
  })

  socket.on("disconnect", () => {
    totalConnections--;
    console.log("User disconnected");

    io.emit("totalConnections", totalConnections);
  });

  io.emit("totalConnections", totalConnections);
})

io.listen(8080);