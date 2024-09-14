type HistoryAction = {
  mode: "draw" | "erase" | "shapes";
  x: number;
  y: number;
  layerId: string;
  color: string;
  drawStrength: number;
  width: number;
  height: number;
}

type History = {
  undo: HistoryAction[];
  redo: HistoryAction[];
}

const initState: History = {
  undo: [],
  redo: [],
}

export const historyReducer = (
  state: History = initState,
  action
): History => {
  switch (action.type) {
    case 'UNDO': {
      const lastAction = state.undo[state.undo.length - 1];

      if (!lastAction) return state;

      return {
        undo: state.undo.slice(0, -1),
        redo: [...state.redo, lastAction]
      }
    }

    case 'REDO': {
      const lastAction = state.redo[state.redo.length - 1];

      if (!lastAction) return state;

      return {
        undo: [...state.undo, lastAction],
        redo: state.redo.slice(0, -1)
      }
    }
    
    case 'SAVE_ACTION': {
      if (state.undo.length === 20) {
        const [, ...rest] = state.undo;
        return {
          undo: [...rest, action.payload],
          redo: []
        }
      }
      return {
        undo: [...state.undo, action.payload],
        redo: []
      }
    }

    default:
      return state;
  }
}