// Types
import { PayloadAction } from '@reduxjs/toolkit';

// Constants
import { COLORS } from '../../state/store';

type CanvasState = {
  width: number;
  height: number;
  mode: 'select' | 'draw' | 'erase';
  color: string;
  drawStrength: number;
  eraserStrength: number;
  blob?: string;
  ws?: WebSocket;
}

type Resolution = 'width' | 'height';

type ResolutionAction = {
  resolution: Resolution;
  value: number;
}

const initState: CanvasState = {
  width: 400,
  height: 400,
  mode: 'select',
  color: '#000000',
  drawStrength: 5,
  eraserStrength: 3,
  blob: undefined,
  ws: undefined
}

export const canvasReducer = (
  state: CanvasState = initState,
  action: PayloadAction<string | ResolutionAction | number>
) => {
  switch (action.type) {
    case 'SET_COLOR': {
      const newColor = COLORS.find(c => c.name === action.payload);

      return { ...state, color: newColor?.value ?? state.color };
    }

    case 'SET_RESOLUTION': {
      const { resolution, value } = action.payload as ResolutionAction;

      return { ...state, [resolution]: value };
    }

    case 'SET_MODE':
      return { ...state, mode: action.payload as 'select' | 'draw' | 'erase' };
    
    case 'SET_DRAW_STRENGTH':
      return { ...state, drawStrength: action.payload as number };
    
    case 'SET_ERASE_STRENGTH':
      return { ...state, eraserStrength: action.payload as number };

    case 'SET_BLOB':
      return { ...state, blob: action.payload };
    
    case 'SET_WS': {
      // const conn =
      return state
    }
    
    default:
      return state;
  }
}