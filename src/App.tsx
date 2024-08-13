// Lib
import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "./state/hooks/reduxHooks";
import { socket } from "./server/socket";

// Styles
import "./App.css";

// Components
import Canvas from "./components/Canvas/Canvas";
import Toolbar from "./components/Toolbar/Toolbar";


function App() {
  const { width, height, layers, show_all } = useAppSelector(state => state.canvas);
  const dispatch = useAppDispatch();
  const [isConnected, setIsConnected] = useState(false);

  const updateResolution = (
    k: "width" | "height",
    v: string
  ) => {
    dispatch({ type: "SET_RESOLUTION", payload: { resolution: k, value: +v } });
  }

  const addLayer = (e) => {
    e.stopPropagation();
    dispatch({ type: "ADD_LAYER" });
  }

  const deleteLayer = (id: string) => {
    dispatch({ type: "REMOVE_LAYER", payload: id });
  }

  const changeLayer = (e: React.ChangeEvent<HTMLInputElement>) => {

    dispatch({ type: "TOGGLE_LAYER", payload: e.target.id });
  }

  const showAllLayers = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SHOW_ALL_LAYERS", payload: e.target.checked });
  }

  const moveLayer = (id: string, dir: 'up' | 'down') => {
    if (dir === "up") {
      dispatch({ type: "MOVE_LAYER_UP", payload: id });
    } else {
      dispatch({ type: "MOVE_LAYER_DOWN", payload: id });
    }
  }

  useEffect(() => {
    function onConnect() {
      console.log("Connected to server");
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log("Disconnected from server");
      setIsConnected(false);
    }

    function onMessage(data) {
      console.log("Message from server", data);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);

    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
    };
  }, []);

  return (
    <>
      {/* <h2>Welcome to Canvas</h2> */}
      {/* <h3>Active Connections: {connections}</h3> */}
      <h3>Websocket on: {isConnected ? "Yes" : "No"}</h3>
      <button onClick={() => socket.emit("message", "hi")}>Send Message</button>
      <button onClick={addLayer}>Add Layer</button>
      {
        layers.map(l => (
          <>
            <input type="radio" id={l.id} checked={l.active} onChange={changeLayer} />
            <label htmlFor={l.id}>{l.name}</label>
            <button onClick={() => moveLayer(l.id, 'up')}>Up</button>
            <button onClick={() => moveLayer(l.id, 'down')}>Down</button>
            <button onClick={() => deleteLayer(l.id)}>Delete</button>
          </>
        ))
      }
      <input type="checkbox" id="show_all_layers" checked={show_all} onChange={showAllLayers} />
      <label htmlFor="show_all_layers">Show All</label>
      <div>
        Width: <input type="number" value={width} onChange={e => updateResolution("width", e.target.value)} />
        Height: <input type="number" value={height} onChange={e => updateResolution("height", e.target.value)} />
      </div>
      <div>
        <Canvas />
      </div>
      <Toolbar />
    </>
  );
}

export default App
