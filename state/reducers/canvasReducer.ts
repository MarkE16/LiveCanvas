// Lib
import { v4 as uuidv4 } from 'uuid';

// Types
import { PayloadAction, Reducer, UnknownAction } from '@reduxjs/toolkit';

// Constants
import * as UTILS from "../../utils";

type Layer = {
  name: string;
  id: string;
  active: boolean;
  hidden: boolean;
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
  show_all: boolean;
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
  color: '#FF0000',
  drawStrength: 5,
  eraserStrength: 3,
  shape: 'rectangle',
  layers: [
    { name: "Layer 1", id: uuidv4(), active: true, hidden: false }
  ],
  scale: 1,
  show_all: false,
}

export const canvasReducer: Reducer<CanvasState, UnknownAction, CanvasState> = (
  state: CanvasState = initState,
  action: PayloadAction<string | ResolutionAction | number | Mode | boolean | Layer[] | Layer>
): CanvasState => {
  switch (action.type) {
    case 'SET_COLOR': {
      return { ...state, color: action.payload as string };
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
      const newLayer = action.payload as Layer ?? UTILS.createLayer();

      newLayer.active = false; // Ensure the new layer is not active if the new layer is provided

      return { ...state, layers: [...state.layers, newLayer] };
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
      const currentActiveLayer = state.layers.find(l => l.active);
      const newLayers = state.layers.map(l => {

        // Update the new active layer, and deactivate the previous active layer
        if (l.id === action.payload || l.id === currentActiveLayer?.id) {
          return { ...l, active: !l.active };
        }

        return l;
      });

      return { ...state, layers: newLayers };
    }
  
    case "MOVE_LAYER_UP": {
      const selectedLayerIndex = state.layers.findIndex(l => l.id === action.payload);
      const newIndex = selectedLayerIndex - 1;

      const newLayers = UTILS.moveLayer(state.layers, selectedLayerIndex, newIndex);

      return { ...state, layers: newLayers };
    }

    case "MOVE_LAYER_DOWN": {
      const selectedLayerIndex = state.layers.findIndex(l => l.id === action.payload);
      const newIndex = selectedLayerIndex + 1;

      const newLayers = UTILS.moveLayer(state.layers, selectedLayerIndex, newIndex);

      return { ...state, layers: newLayers };
    }

    // This action is dispatched when the server sends the layers.
    // This should not be used anywhere else.
    case "SET_LAYERS": {
      return { ...state, layers: action.payload as Layer[] };
    }

    case "RENAME_LAYER": {
      const { id, name } = action.payload as Layer;

      const newLayers = state.layers.map(l => {
        if (l.id === id) {
          return { ...l, name };
        }

        return l;
      });

      return { ...state, layers: newLayers };
    }

    case "SET_LAYER_ID": {
      const { id, newId } = action.payload;

      const newLayers = state.layers.map(l => {
        if (l.id === id) {
          return { ...l, id: newId };
        }

        return l;
      });

      return { ...state, layers: newLayers };
    }

    case "TOGGLE_VISIBILITY": {
      const newLayers = state.layers.map(l => {
        if (l.id === action.payload) {
          return { ...l, hidden: !l.hidden };
        }

        return l;
      });

      return { ...state, layers: newLayers };
    }

    case 'INCREASE_SCALE': {
      const newScale = Math.min(3, state.scale + 0.1);
      return { ...state, scale: newScale };
    }
    
    case 'DECREASE_SCALE': {
      const newScale = Math.max(0.2, state.scale - 0.1);
      return { ...state, scale: newScale };
    }

    case 'SHOW_ALL_LAYERS':
      return { ...state, show_all: action.payload as boolean };
    
    default:
      return state;
  }
}