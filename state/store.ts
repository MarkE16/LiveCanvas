import { configureStore } from "@reduxjs/toolkit";
import { canvasReducer } from "./reducers/canvasReducer";
import { historyReducer } from "./reducers/historyReducer";

export const store = configureStore({
  reducer: {
    canvas: canvasReducer,
    history: historyReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    immutableCheck: {
      ignoredPaths: ['canvas.layers']
    }
  })
});

export const MODES = [
  { name: 'select', icon: 'fa-mouse-pointer', shortcut: 's' },
  { name: 'draw', icon: 'fa-pen-nib', shortcut: 'd' },
  { name: 'erase', icon: 'fa-eraser', shortcut: 'e' },
  { name: 'shapes', icon: 'fa-shapes', shortcut: 'a' },
  { name: 'zoom_in', icon: 'fa-search-plus', shortcut: '+' },
  { name: 'zoom_out', icon: 'fa-search-minus', shortcut: '_' },
  { name: 'move', icon: 'fa-arrows-alt', shortcut: 'm' },
  { name: 'undo', icon: 'fa-undo', shortcut: 'ctrl + z' },
  { name: 'redo', icon: 'fa-redo', shortcut: 'ctrl + shift + z' },
]

export const SHAPES = [
  { name: 'rectangle', icon: 'fa-square' },
  { name: 'circle', icon: 'fa-circle' },
  { name: 'triangle', icon: 'fa-play' },
]

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;