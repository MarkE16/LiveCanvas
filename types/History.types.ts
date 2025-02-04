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
