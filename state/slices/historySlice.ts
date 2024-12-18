import { History } from "../../types";
import { createSlice } from "@reduxjs/toolkit";

const initialState: History = {
	undo: [],
	redo: []
};

const historySlice = createSlice({
	name: "history",
	initialState,
	reducers: {
		undo: (state) => {
			const lastAction = state.undo[state.undo.length - 1];

			if (!lastAction) return state;

			return {
				undo: state.undo.slice(0, -1),
				redo: [...state.redo, lastAction]
			};
		},
		redo: (state) => {
			const lastAction = state.redo[state.redo.length - 1];

			if (!lastAction) return state;

			return {
				undo: [...state.undo, lastAction],
				redo: state.redo.slice(0, -1)
			};
		},
		saveAction: (state, action) => {
			let prevActions = state.undo;

			if (state.undo.length === 20) {
				const [, ...rest] = state.undo;

				prevActions = [...rest];
			}

			return {
				undo: [...prevActions, action.payload],
				redo: []
			};
		}
	}
});

export const { undo, redo, saveAction } = historySlice.actions;

export default historySlice.reducer;
