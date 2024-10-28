import { configureStore, combineReducers } from "@reduxjs/toolkit";
import canvasSliceReducer from "./slices/canvasSlice";
import historySliceReducer from "./slices/historySlice";

import type { Shapes } from "../types";

const rootReducer = combineReducers({
	canvas: canvasSliceReducer,
	history: historySliceReducer
});

export const createStore = (preloadedState?: Partial<RootState>) => {
	return configureStore({
		reducer: rootReducer,
		preloadedState
	});
};

export const MODES = [
	{ name: "select", icon: "fa-mouse-pointer", shortcut: "s" },
	{ name: "draw", icon: "fa-pen-nib", shortcut: "d" },
	{ name: "erase", icon: "fa-eraser", shortcut: "e" },
	{ name: "shapes", icon: "fa-shapes", shortcut: "a" },
	{ name: "zoom_in", icon: "fa-search-plus", shortcut: "+" },
	{ name: "zoom_out", icon: "fa-search-minus", shortcut: "_" },
	{ name: "move", icon: "fa-arrows-alt", shortcut: "m" },
	{ name: "undo", icon: "fa-undo", shortcut: "ctrl + z" },
	{ name: "redo", icon: "fa-redo", shortcut: "ctrl + shift + z" }
];

export const SHAPES: Shapes = [
	{ name: "rectangle", icon: "fa-square" },
	{ name: "circle", icon: "fa-circle" },
	{ name: "triangle", icon: "fa-play" }
];

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore["dispatch"];
