const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

let totalConnections = 0;

function updateCount() {
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(totalConnections);
    }
  });
}

server.on("connection", (socket) => {
  totalConnections++;
  // updateCount();
  socket.on("message", (message) => {
    server.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    })
  });
});

server.on("error", (err) => {
  console.error(err);
});

server.on("close", () => {
  totalConnections--;
  // updateCount();
  console.log("Server closed");
});

console.log("WebSocket server started on ws://localhost:8080");
