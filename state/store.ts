import { configureStore, combineReducers } from "@reduxjs/toolkit";
import canvasSliceReducer from "./slices/canvasSlice";
import historySliceReducer from "./slices/historySlice";

import type { Modes, Shapes } from "../types";

const rootReducer = combineReducers({
	canvas: canvasSliceReducer,
	history: historySliceReducer
});

/**
 * Creates a Redux store with the given preloaded state.
 * @param preloadedState The preloaded state to initialize the store with.
 * @returns A Redux store.
 */
export const createStore = (preloadedState?: Partial<RootState>) => {
	return configureStore({
		reducer: rootReducer,
		preloadedState
	});
};

export const MODES: Modes = [
	{ name: "select", shortcut: "s" },
	{ name: "draw", shortcut: "d" },
	{ name: "erase", shortcut: "e" },
	{ name: "shapes", shortcut: "a" },
	{ name: "eye_drop", shortcut: "i" },
	{ name: "zoom_in", shortcut: "+" },
	{ name: "zoom_out", shortcut: "_" },
	{ name: "move", shortcut: "m" },
	{ name: "undo", shortcut: "ctrl + z" },
	{ name: "redo", shortcut: "ctrl + shift + z" }
];

export const SHAPES: Shapes = [
	{ name: "rectangle", icon: "fa-square" },
	{ name: "circle", icon: "fa-circle" },
	{ name: "triangle", icon: "fa-play" }
];

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore["dispatch"];
