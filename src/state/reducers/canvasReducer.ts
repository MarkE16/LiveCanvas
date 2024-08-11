// Types
import { PayloadAction } from '@reduxjs/toolkit';

// Constants
import { COLORS } from '../../state/store';

type CanvasState = {
  width: number;
  height: number;
  color: string;
  blob?: Blob;
}

type Resolution = 'width' | 'height';

type ResolutionAction = {
  resolution: Resolution;
  value: number;
}

const initState: CanvasState = {
  width: 400,
  height: 400,
  color: '#000000',
  blob: undefined
}

export const canvasReducer = (
  state: CanvasState = initState,
  action: PayloadAction<string | ResolutionAction>
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

    case 'SET_BLOB':
      return { ...state, blob: action.payload };
    
    default:
      return state;
  }
}