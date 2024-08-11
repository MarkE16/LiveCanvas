// Lib
import { useAppSelector, useAppDispatch } from "./state/hooks/reduxHooks";

// Styles
import "./App.css";

// Components
import Canvas from "./components/Canvas/Canvas";
import Toolbar from "./components/Toolbar/Toolbar";


function App() {
  const s = useAppSelector(state => state.canvas);
  const dispatch = useAppDispatch();

  const updateResolution = (
    k: "width" | "height",
    v: number
  ) => {
    dispatch({ type: "SET_RESOLUTION", payload: { resolution: k, value: +v } });
  }

  return (
    <>
      <h2>Welcome to Canvas</h2>
      <div>
        Width: <input type="number" value={s.width} onChange={e => updateResolution("width", e.target.value)} />
        Height: <input type="number" value={s.height} onChange={e => updateResolution("height", e.target.value)} />
      </div>
      <Canvas />
      <Toolbar />
    </>
  );
}

export default App
