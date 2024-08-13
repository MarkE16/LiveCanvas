// Types
import { PayloadAction } from '@reduxjs/toolkit';

// Constants
import { COLORS } from '../../state/store';

type Layer = {
  id: number;
  active: boolean;
}

type Mode = 'select' | 'draw' | 'erase' | 'shapes' | 'zoom_in' | 'zoom_out' | 'move';

type CanvasState = {
  width: number;
  height: number;
  mode: Mode;
  color: string;
  drawStrength: number;
  eraserStrength: number;
  shape: 'rectangle' | 'circle' | 'triangle';
  layers: Layer[];
  scale: number;
  blob?: string;
  ws?: WebSocket;
}

type Resolution = 'width' | 'height';

type ResolutionAction = {
  resolution: Resolution;
  value: number;
}

const initState: CanvasState = {
  // width: 400,
  // height: 400,
  width: window.innerWidth,
  height: window.innerHeight,
  mode: 'select',
  color: '#000000',
  drawStrength: 5,
  eraserStrength: 3,
  shape: 'rectangle',
  layers: [
    { id: 0, active: true }
  ],
  scale: 1,
  blob: undefined,
  ws: undefined
}

export const canvasReducer = (
  state: CanvasState = initState,
  action: PayloadAction<string | ResolutionAction | number | Mode>
) => {
  console.log(state.scale)
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
      return { ...state, mode: action.payload as Mode };
    
    case 'SET_DRAW_STRENGTH':
      return { ...state, drawStrength: action.payload as number };
    
    case 'SET_ERASE_STRENGTH':
      return { ...state, eraserStrength: action.payload as number };
    
    case 'SET_SHAPE':
      return { ...state, shape: action.payload as 'rectangle' | 'circle' | 'triangle' };
    
    case 'ADD_LAYER': {
      const currentActiveIndex = state.layers.findIndex(l => l.active);
      const newLayer = { id: state.layers.length, active: true };
      
      const newLayers = state.layers.map(l => {
        if (l.id === currentActiveIndex) {
          return { ...l, active: false };
        }
        return l;
      })

      return { ...state, layers: [...newLayers, newLayer] };
    }

    case 'REMOVE_LAYER': {
      if (state.layers.length === 1) return state;

       const pendingLayer = state.layers.find(l => l.id === action.payload);

        const newLayers = state.layers.filter(l => l.id !== pendingLayer?.id);

        if (pendingLayer?.active) {
          // redux ignore. `.filter` returns a new array, so we can safely access the last element
          newLayers[newLayers.length - 1].active = true;
        }

      return { ...state, layers: newLayers };
    }

    case 'TOGGLE_LAYER': {
      const currentActiveIndex = state.layers.findIndex(l => l.active);
      const newLayers = state.layers.map(l => {

        // Update the new active layer, and deactivate the previous active layer
        if (l.id === action.payload || l.id === currentActiveIndex) {
          return { ...l, active: !l.active };
        }

        return l;
      });

      return { ...state, layers: newLayers };
    }

    case 'INCREASE_SCALE': {
      const newScale = Math.min(2, state.scale + 0.1);
      return { ...state, scale: newScale };
    }
    
    case 'DECREASE_SCALE': {
      const newScale = Math.max(0.2, state.scale - 0.1);
      return { ...state, scale: newScale };
    }

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