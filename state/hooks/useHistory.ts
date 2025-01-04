// Lib
import { create } from "zustand";

// Types
import type { HistoryAction } from "../../types";

// TODO: This hook *technically* works, but the issue is trying to mess around with the Canvas API
// to get the undo and redo actions to work. It's a bit more complicated than I thought it would be.
// This may need to be refactored or rethought.

/**
 * A custom hook that manages the undo and redo actions for the canvas.
 * @returns An object containing the undo and redo actions, as well as functions to add, undo, and redo actions.
 */
type HistoryStore = {
	undoStack: HistoryAction[];
	redoStack: HistoryAction[];
	push: (action: HistoryAction) => void;
	undo: () => void;
	redo: () => void;
};

const useHistory = create<HistoryStore>((set) => {
	function push(action: HistoryAction) {
		set((state) => ({
			undoStack: [...state.undoStack, action],
			redoStack: []
		}));
	}

	function undo() {
		set((state) => {
			const [action, ...rest] = state.undoStack;
			return {
				undoStack: rest,
				redoStack: [action, ...state.redoStack]
			};
		});
	}

	function redo() {
		set((state) => {
			const [action, ...rest] = state.redoStack;
			return {
				undoStack: [action, ...state.undoStack],
				redoStack: rest
			};
		});
	}

	return {
		undoStack: [],
		redoStack: [],
		push,
		undo,
		redo
	};
});

export default useHistory;
