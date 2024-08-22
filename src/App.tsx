// Lib
import { useEffect } from "react";
import { MODES } from "./state/store";
import { useAppDispatch } from "./state/hooks/reduxHooks";

// Styles
import "./App.css";

// Components
import Navbar from "./components/Navbar/Navbar";
import Main from "./components/Main/Main";

function App() {
  const dispatch = useAppDispatch();
  
  // Add keyboard listeners for each mode.
  useEffect(() => {
    function listenToKeyboard(e: KeyboardEvent) {
      const mode = MODES.find(m => m.shortcut === e.key);
      if (mode) {
        console.log(`Switching to mode: ${mode.name}`);
        dispatch({ type: "SET_MODE", payload: mode.name });
      }
    }

    function listenToZoom(e: Event) {
      if (e instanceof WheelEvent) {
        if (!e.shiftKey) return;

        if (e.deltaY > 0) {
          dispatch({ type: "DECREASE_SCALE" });
        } else {
          dispatch({ type: "INCREASE_SCALE" });
        }
      
      // On click.
      } else {
        
      }
    }

    document.addEventListener("keydown", listenToKeyboard);
    document.addEventListener("wheel", listenToZoom);
    return () => {
      document.removeEventListener("keydown", listenToKeyboard);
      document.removeEventListener("wheel", listenToZoom);
    };

  }, [dispatch]);

  return (
    <>
      <Navbar />

      <Main />
    </>
  );
}

export default App
