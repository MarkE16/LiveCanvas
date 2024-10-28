// Lib
import { useAppSelector, useAppDispatch } from "./reduxHooks";
import { useCallback } from "react";

// Types
import type { HistoryAction, HistoryUtils } from "../../types";


// TODO: This hook *technically* works, but the issue is trying to mess around with the Canvas API
// to get the undo and redo actions to work. It's a bit more complicated than I thought it would be.
// This may need to be refactored or rethought.

/**
 * A custom hook that manages the undo and redo actions for the canvas.
 * @returns An object containing the undo and redo actions, as well as functions to add, undo, and redo actions.
 */
const useHistory = (): HistoryUtils => {
	// undo and redo utilize the Stack data structure.
	const { undo, redo } = useAppSelector((state) => state.history);
	const dispatch = useAppDispatch();

	const addHistory = useCallback(
		(action: HistoryAction) => {
			dispatch({ type: "SAVE_ACTION", payload: action });
		},
		[dispatch]
	);

	const undoAction = useCallback(() => {
		dispatch({ type: "UNDO" });
	}, [dispatch]);

	const redoAction = useCallback(() => {
		dispatch({ type: "REDO" });
	}, [dispatch]);

	return {
		undo,
		redo,
		addHistory,
		undoAction,
		redoAction
	};
};

export default useHistory;
