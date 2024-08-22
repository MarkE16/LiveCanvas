type SavedAction = {
  base64: string;
  type: 'undo' | 'redo';
}

type SavedActionsState = {
  undo: SavedAction[];
  redo: SavedAction[];
}

const initState: SavedActionsState = {
  undo: [],
  redo: [],
}

export const savedActionsReducer = (
  state: SavedActionsState = initState,
  action
): SavedActionsState => {
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
      return {
        undo: [...state.undo, action.payload],
        redo: []
      }
    }

    default:
      return state;
  }
}