import { Coordinates } from "./index";

export type HistoryAction = {
	mode: "draw" | "erase" | "shapes";
	path: Coordinates[];
	layerId: string;
	color: string;
	drawStrength: number;
};

export type HistoryUtils = {
	undo: HistoryAction[];
	redo: HistoryAction[];
	addHistory: (action: HistoryAction) => void;
	undoAction: () => void;
	redoAction: () => void;
};