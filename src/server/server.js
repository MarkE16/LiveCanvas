import { Server } from "socket.io";

const io = new Server({
  maxHttpBufferSize: 1e7, // 10MB / 10,000,000 bytes. 1e7 === 10,000,000
  cors: {
    origin: "http://localhost:5173",
  }
});

let layers = undefined;

io.on("connection", socket => {
  console.log("User connected");
  io.emit("user-connect", layers);

  socket.on("get-layers", () => {
    socket.emit("layer-update", layers);
  })

  // data should be an ArrayBuffer and the id of the layer to update.
  socket.on("canvas-update", (...data) => {
    console.log("websocket received CANVAS_UPDATE: ", data);
    socket.broadcast.emit("canvas-update", ...data);
  });

  // data should be an array of layer objects.
  socket.on("layer-update", data => {

    if (layers === undefined) {
      layers = data;
    }

    console.log("websocket received LAYER_UPDATE: ", data);
    socket.broadcast.emit("layer-update", layers);
  });

  // data should be the layer object.
  socket.on("layer-add", data => {
    if (layers !== undefined) {
      const allInactive = layers.map(layer => ({ ...layer, active: false }));

      layers = [...allInactive, data];
    }

    console.log("websocket received LAYER_ADD: ", data);
    socket.broadcast.emit("layer-update", layers);
  });

  // data should be the layer id.
  socket.on("layer-remove", data => {
    if (layers !== undefined) {
      const layer = layers.find(layer => layer.id === data);
      layers = layers.filter(layer => layer.id !== data);

      if (layer.active) {
        layers[0].active = true;
      }
      
    }
    console.log("websocket received LAYER_REMOVE: ", data);

    socket.broadcast.emit("layer-update", layers);
  });

  // data should be the layer id and the direction to move the layer (up/down).
  socket.on("layer-move", (...data) => {
    if (layers !== undefined) {
      const index = layers.findIndex(layer => layer.id === data[0]);
      const newIndex = data[1] === "up" ? index - 1 : index + 1;

      if (newIndex < 0 || newIndex >= layers.length) {
        console.log("websocket failed to move layer: INVALID INDEX");
        return;
      }

      const temp = layers[index];
      layers[index] = layers[newIndex];
      layers[newIndex] = temp;

    }

    console.log("websocket received LAYER_MOVE: ", data);
    socket.broadcast.emit("layer-update", layers);
  })

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

io.listen(8080);