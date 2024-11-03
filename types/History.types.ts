import { Coordinates } from "./index";

export type HistoryAction = {
	mode: "draw" | "erase" | "shapes";
	path: Coordinates[];
	layerId: string;
	color: string;
	drawStrength: number;
	width: number;
	height: number;
};

export type History = {
	undo: HistoryAction[];
	redo: HistoryAction[];
};

export type HistoryUtils = {
	undo: HistoryAction[];
	redo: HistoryAction[];
	addHistory: (action: HistoryAction) => void;
	undoAction: () => void;
	redoAction: () => void;
};
