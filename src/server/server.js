import { Server } from "socket.io";

const io = new Server({
  maxHttpBufferSize: 1e7, // 10MB / 10,000,000 bytes. 1e7 === 10,000,000
  cors: {
    origin: "http://localhost:5173",
  }
});

/**
 * type Layer =  {
 *  id: string;
 *  name: string;
 *  buffer: ArrayBuffer; // => To store the image data.
 * }
 */
let layers = undefined;


io.on("connection", socket => {
  console.log("User connected");
  socket.emit("user-connect", layers);

  // data should be an ArrayBuffer and the id of the layer to update.
  socket.on("canvas-update", (...data) => {

    // data[0] is the buffer
    // data[1] is the layer id

    if (layers === undefined) {
      console.log("websocket failed to update canvas: NO LAYERS");
      return;
    }

    const layer = layers.findIndex(layer => layer.id === data[1]);
    if (layer === undefined) {
      console.log("websocket failed to update canvas: LAYER NOT FOUND");
      return;
    }
    layers[layer].buffer = data[0];

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
      layers.forEach(layer => {
        delete layer.active; // We don't care about the active property in the server.
      })

      delete data.active; // We don't care about the active property in the server.

      layers.push(data)
    }

    console.log("websocket received LAYER_ADD: ", data);
    socket.broadcast.emit("layer-update", layers);
  });

  // data should be the layer id.
  socket.on("layer-remove", data => {
    if (layers !== undefined) {
      layers = layers.filter(layer => layer.id !== data);
      
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