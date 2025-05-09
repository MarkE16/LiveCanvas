import { createStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { createCanvasSlice } from "./slices/canvasSlice";
import { createHistorySlice } from "./slices/historySlice";
import { createCanvasElementsSlice } from "./slices/canvasElementsSlice";

import type { Modes, Shapes, SliceStores } from "../types";

export type Store = ReturnType<typeof initializeStore>;

/**
 * Creates a Zustand store that combines the canvas, history, and canvas elements slices.
 * @param preloadedState The preloaded state to initialize the store with.
 * @returns A Zustand store.
 */
export function initializeStore(preloadedState: Partial<SliceStores> = {}) {
	// `structuredClone` throws an error if the object contains functions as
	// functions are not serializable. We need to remove the functions from the
	// preloaded state before passing it to `structuredClone`.
	const stateWithoutFunctions = Object.entries(preloadedState).reduce(
		(acc, [key, value]) => {
			if (typeof value !== "function") {
				acc[key] = value;
			}
			return acc;
		},
		{} as Partial<SliceStores>
	);

	return createStore<SliceStores>()(
		subscribeWithSelector((...a) => ({
			...createCanvasSlice(...a),
			...createHistorySlice(...a),
			...createCanvasElementsSlice(...a),
			// We want to call structuredClone on the preloadedState to ensure that it is a deep clone.
			// This ensures that the preloadedState is not mutated when the store is initialized.
			// This is beneficial for testing purposes, but also ensures that the preloadedState is not mutated
			// when the store is initialized.
			...preloadedState, // spread the state to pass the functions, if any.
			// Spread the state without functions to ensure that the functions are not serialized and
			// the values are not mutated.
			...structuredClone(stateWithoutFunctions)
		}))
	);
}

export const MODES: Modes = [
	{ name: "select", shortcut: "s" },
	{ name: "draw", shortcut: "d" },
	{ name: "erase", shortcut: "e" },
	{ name: "shapes", shortcut: "a" },
	// { name: "text", shortcut: "t" },
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
