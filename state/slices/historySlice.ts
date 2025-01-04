import type { StateCreator } from "zustand";
import type { HistoryAction, HistoryStore } from "../../types";

export const createHistorySlice: StateCreator<
	HistoryStore,
	[],
	[],
	HistoryStore
> = (set, get) => {
	function push(action: HistoryAction) {
		set((state) => ({
			undoStack: [action, ...state.undoStack],
			redoStack: []
		}));
	}

	function undo() {
		const { undoStack, redoStack } = get();

		if (!undoStack.length) return; // Nothing to undo

		set(() => ({
			undoStack: undoStack.slice(1),
			redoStack: [undoStack[0], ...redoStack]
		}));
	}

	function redo() {
		const { redoStack, undoStack } = get();
		if (!redoStack.length) return; // Nothing to redo
		
		set(() => ({
			undoStack: [redoStack[0], ...undoStack],
			redoStack: redoStack.slice(1)
		}));
	}

	return {
		undoStack: [],
		redoStack: [],
		push,
		undo,
		redo
	};
};
