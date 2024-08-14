// Lib
import { useAppSelector, useAppDispatch } from "./state/hooks/reduxHooks";

// Styles
import "./App.css";

// Components
import Canvas from "./components/Canvas/Canvas";
import Toolbar from "./components/Toolbar/Toolbar";
import LayerInfo from "./components/LayerInfo/LayerInfo";


function App() {
  const { width, height, layers, show_all } = useAppSelector(state => state.canvas);
  const dispatch = useAppDispatch();

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

  const showAllLayers = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SHOW_ALL_LAYERS", payload: e.target.checked });
  }


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
