// Lib
import { useAppSelector, useAppDispatch } from "./reduxHooks";
import { useCallback } from "react";

// Types

type Coordinates = {
  x: number;
  y: number;
}

type HistoryAction = {
  mode: "draw" | "erase" | "shapes";
  path: Coordinates[];
  layerId: string;
  color: string;
  drawStrength: number;
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
  const { undo, redo } = useAppSelector(state => state.history);
  const dispatch = useAppDispatch();

  // console.log(history);

  const addHistory = useCallback((action: HistoryAction) => {
    dispatch({ type: 'SAVE_ACTION', payload: action });
  }, [dispatch]);

  const undoAction = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, [dispatch]);

  const redoAction = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, [dispatch]);

  return {
    undo,
    redo,
    addHistory,
    undoAction,
    redoAction
  };
}

export default useHistory;