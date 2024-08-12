import { configureStore } from "@reduxjs/toolkit";
import { canvasReducer } from "./reducers/canvasReducer";
import { Color } from "../components/Toolbar/Toolbar.types";

export const store = configureStore({
  reducer: {
    canvas: canvasReducer
  }
});

export const COLORS: Color[] = [
  { name: 'black', value: '#000000' },
  { name: 'red', value: '#FF0000' },
  { name: 'green', value: '#00FF00' },
  { name: 'blue', value: '#0000FF' },
  { name: 'yellow', value: '#FFFF00' },
  { name: 'cyan', value: '#00FFFF' },
  { name: 'magenta', value: '#FF00FF' },
  { name: 'white', value: '#FFFFFF' },
]

export const MODES = [
  { name: 'select', icon: 'fa-mouse-pointer', shortcut: 's' },
  { name: 'draw', icon: 'fa-pen-nib', shortcut: 'd' },
  { name: 'erase', icon: 'fa-eraser', shortcut: 'e' },
]

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;