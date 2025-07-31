import type { StateCreator } from "zustand";
import type { SliceStores, HistoryAction, HistoryStore } from "@/types";

export const createHistorySlice: StateCreator<
	SliceStores,
	[],
	[],
	HistoryStore
> = (set, get) => {
	function applyChanges(
		action: HistoryAction,
		actionPerformed: "undo" | "redo" = "undo"
	) {
		const {
			changeElementProperties,
			createElement,
			deleteElement,
			undoStack,
			redoStack
		} = get();
		console.log(undoStack, redoStack);
		switch (action.type) {
			case "add_element": {
				const { type, ...rest } = action.properties;
				if (!type) {
					throw new Error("Element type is required for add_element action");
				}

				if (actionPerformed === "undo") {
					// We're doing the inverse, so we remove the element.
					deleteElement((element) => element.id === action.properties.id);
				} else {
					createElement(type, rest);
				}
				break;
			}
			case "move_element": {
				const { layerId, dx, dy } = action.properties;

				changeElementProperties(
					(state) => {
						if (actionPerformed === "undo") {
							// We need to move the element back to its original position.
							if (state.type === "brush" || state.type === "eraser") {
								return {
									...state,
									path: state.path.map((point) => ({
										...point,
										x: point.x - dx,
										y: point.y - dy
									}))
								};
							}
							return {
								...state,
								x: state.x - dx,
								y: state.y - dy
							};
						}

						// We need to move the element to its new position.
						if (state.type === "brush" || state.type === "eraser") {
							return {
								...state,
								path: state.path.map((point) => ({
									...point,
									x: point.x + dx,
									y: point.y + dy
								}))
							};
						}
						return {
							...state,
							x: state.x + dx,
							y: state.y + dy
						};
					},
					(element) => element.layerId === layerId
				);
				break;
			}
		}
	}

	function pushHistory(action: HistoryAction) {
		set((state) => ({
			undoStack: [action, ...state.undoStack],
			redoStack: []
		}));
	}

	function undo() {
		const { undoStack, redoStack, changeElementProperties } = get();

		if (!undoStack.length) return; // Nothing to undo

		const lastAction = undoStack[0];

		applyChanges(lastAction, "undo");

		set(() => ({
			undoStack: undoStack.slice(1),
			redoStack: [lastAction, ...redoStack]
		}));
	}

	function redo() {
		const { redoStack, undoStack, changeElementProperties } = get();
		if (!redoStack.length) return; // Nothing to redo

		const lastAction = redoStack[0];

		applyChanges(lastAction, "redo");

		set(() => ({
			undoStack: [lastAction, ...undoStack],
			redoStack: redoStack.slice(1)
		}));
	}

	return {
		undoStack: [],
		redoStack: [],
		pushHistory,
		undo,
		redo
	};
};
