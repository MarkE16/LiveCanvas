// Lib
import { useRef, useCallback } from "react";

// Types

type HistoryAction = {
  mode: "draw" | "erase" | "shapes";
  x: number;
  y: number;
  width: number;
  height: number;
}

type History = {
  undo: HistoryAction[];
  redo: HistoryAction[];
}

type HistoryUtils = {
  undo: HistoryAction[];
  redo: HistoryAction[];
  addHistory: (action: HistoryAction) => void;
  undoAction: () => void;
  redoAction: () => void;
}

/**
 * A custom hook that manages the undo and redo actions for the canvas.
 * @returns An object containing the undo and redo actions, as well as functions to add, undo, and redo actions.
 */
const useHistory = (): HistoryUtils => {
  // undo and redo utilize the Stack data structure.
  const history = useRef<History>({ undo: [], redo: [] });

  const addHistory = useCallback((action: HistoryAction) => {
    history.current.undo.push(action);

    history.current.redo.length = 0; // Clear redo history
  }, []);

  const undoAction = useCallback(() => {
    const lastAction = history.current.undo.pop();

    if (lastAction) {
      history.current.redo.push(lastAction);
    } else {
      throw new Error("No more undo actions");
    }
  }, []);

  const redoAction = useCallback(() => {
    const lastAction = history.current.redo.pop();

    if (lastAction) {
      history.current.undo.push(lastAction);
    } else {
      throw new Error("No more redo actions");
    }
  }, []);

  return {
    undo: history.current.undo,
    redo: history.current.redo,
    addHistory,
    undoAction,
    redoAction
  };
}

export default useHistory;