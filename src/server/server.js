import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  }
});

io.on("connection", socket => {
  console.log("User connected");

  socket.on("message", message => {
    console.log(message);
    io.emit("message", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
})

io.listen(8080);