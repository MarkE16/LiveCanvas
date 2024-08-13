// Lib
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "./state/hooks/reduxHooks";

// Styles
import "./App.css";

// Components
import Canvas from "./components/Canvas/Canvas";
import Toolbar from "./components/Toolbar/Toolbar";


function App() {
  const { width, height, ws, layers } = useAppSelector(state => state.canvas);
  const dispatch = useAppDispatch();
  const [connections, setConnections] = useState(0);

  const updateResolution = (
    k: "width" | "height",
    v: string
  ) => {
    dispatch({ type: "SET_RESOLUTION", payload: { resolution: k, value: +v } });
  }

  // useEffect(() => {
  //   const conn = new WebSocket("ws://localhost:8080");

  //   conn.onopen = () => {
  //     console.log("Connected to server");
  //   }

  //   conn.onclose = () => {
  //     conn?.send("Disconnected");
  //     console.log("Disconnected from server");
  //   }

  //   conn.onmessage = (e) => {
  //     (e.data as Blob).text().then(d => {
  //       dispatch({ type: "SET_BLOB", payload: d });
  //     })
  //   }

  //   dispatch({ type: "SET_WS", payload: conn });

  //   return () => {
  //     conn?.close();
  //   }

  // }, [dispatch]);

  // function wsSent() {
  //   if (ws?.readyState === 1) {
  //     ws.send(s.blob);
  //   }
  // }

  const addLayer = (e) => {
    e.stopPropagation();
    dispatch({ type: "ADD_LAYER" });
  }

  const deleteLayer = (e) => {
    e.stopPropagation();
    dispatch({ type: "REMOVE_LAYER", payload: layers.length - 1 });
  }

  const changeLayer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = +e.target.id;
    dispatch({ type: "TOGGLE_LAYER", payload: id });
  }

  return (
    <>
      {/* <h2>Welcome to Canvas</h2> */}
      {/* <h3>Active Connections: {connections}</h3> */}
      {/* <button onClick={wsSent}>Send Message</button> */}
      <button onClick={addLayer}>Add Layer</button>
      <button onClick={deleteLayer}>Delete Layer</button>
      {
        layers.map(l => (
          <>
            <input type="radio" id={l.id.toString()} checked={l.active} onChange={changeLayer} />
            <label htmlFor={l.id.toString()}>Layer {l.id}</label>
          </>
        ))
      }
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
