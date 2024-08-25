// Lib
import { useEffect } from "react";
import { MODES } from "./state/store";
import { useAppDispatch } from "./state/hooks/reduxHooks";

// Styles
import "./App.css";

// Components
import Navbar from "./components/Navbar/Navbar";
import Main from "./components/Main/Main";
import { closeIndexedDB, getIndexedDB } from "./state/idb";

function App() {
  const dispatch = useAppDispatch();
  
  // Add keyboard listeners for each mode.
  useEffect(() => {
    function listenToKeyboard(e: KeyboardEvent) {
      let shortcut = "";
      
      if (e.ctrlKey) shortcut += "ctrl + ";
      if (e.shiftKey) shortcut += "shift + ";
      if (e.altKey) shortcut += "alt + ";
      
      shortcut += e.key.toLowerCase();
      
      const mode = MODES.find(m => m.shortcut === shortcut);
      
      if (mode) {
        e.preventDefault();
        if (mode.name === "undo") {
          dispatch({ type: "UNDO" });
        } else if (mode.name === "redo") {
          dispatch({ type: "REDO" });
        } else {
          console.log(`Switching to mode: ${mode.name}`);
          dispatch({ type: "SET_MODE", payload: mode.name });
        }
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
        // ...
      }
    }

    document.addEventListener("keydown", listenToKeyboard);
    document.addEventListener("wheel", listenToZoom);
    return () => {
      document.removeEventListener("keydown", listenToKeyboard);
      document.removeEventListener("wheel", listenToZoom);
    };

  }, [dispatch]);
  
  // Open the database of IndexedDB.
  useEffect(() => {
    async function checkStoragePersistency() {
      if (!navigator.storage || !navigator.storage.persist) return;

      const isPersisted = await navigator.storage.persisted();

      if (!isPersisted) {
        const isPersisting = await navigator.storage.persist();

        if (isPersisting) {
          console.log("Storage is now persisted.");
        } else {
          console.error("Storage was not persisted.");
        }
      } else {
        console.log("Storage is already persisted.");
      }
    }

    // Check if the browser supports IndexedDB.

    if (!window.indexedDB) {
      console.error("Your browser doesn't support a stable version of IndexedDB. You will not be able to save your work.");
      return;
    }

    // Check if the database persists.
    checkStoragePersistency().then(() => getIndexedDB())

    return () => {
      closeIndexedDB();
    }
  }, []);

  return (
    <>
      <Navbar />

      <Main />
    </>
  );
}

export default App
