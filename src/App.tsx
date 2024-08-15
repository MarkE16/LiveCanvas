// Lib
import { socket } from "./server/socket";
import { useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "./state/hooks/reduxHooks";
import UTILS from "./utils";

// Styles
import "./App.css";

// Components
import Canvas from "./components/Canvas/Canvas";
import Toolbar from "./components/Toolbar/Toolbar";
import LayerInfo from "./components/LayerInfo/LayerInfo";



function App() {
  const { width, height, layers, show_all } = useAppSelector(state => state.canvas);
  
  // For use in the socket.on("layer-update") callback
  // to prevent infinite loops in the effect.
  const layersRef = useRef(layers);
  const dispatch = useAppDispatch();

  const updateResolution = (
    k: "width" | "height",
    v: string
  ) => {
    dispatch({ type: "SET_RESOLUTION", payload: { resolution: k, value: +v } });
  }

  const addLayer = (e) => {
    const newLayer = UTILS.createLayer()
    e.stopPropagation();
    if (socket.connected) {
      socket.emit("layer-add", newLayer);
    }


    
    dispatch({ type: "ADD_LAYER", payload: newLayer });
  }

  const showAllLayers = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SHOW_ALL_LAYERS", payload: e.target.checked });
  }

  
  // Socket for listening for layer changes.
  useEffect(() => {
    
    const updateLayers = (pendingLayers) => {
  
      console.log(pendingLayers)
      const newLayers = pendingLayers.map((layer, i) => {
        return { ...layer, active: layersRef.current[i]?.active ?? false };
      });
  
      console.log(newLayers)
  
      dispatch({ type: "SET_LAYERS", payload: newLayers });
    }

    socket.on("layer-update", (layers) => {
      updateLayers(layers);
    });

    socket.once("user-connect", (layers) => {
      if (!layers) {
        socket.emit("layer-update", layersRef.current);
      } else {
        updateLayers(layers);
      }
    });

    // ONLY CALL THIS ONCE HERE.
    // When using the socket elsewhere,
    // only set up an effect that listens for
    // socket events.
    socket.connect();


    return () => {
      socket.off("layer-update");
      socket.disconnect();
    };

  }, [dispatch]);


  return (
    <>
      <button onClick={addLayer}>Add Layer</button>
      {
        layers.map(layer => <LayerInfo {...layer} key={layer.id} />)
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
