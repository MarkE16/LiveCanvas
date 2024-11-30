import { v4 as uuidv4 } from "uuid";

export type CanvasState = {
	width: number;
	height: number;
	mode: Mode;
	color: string;
	drawStrength: number;
	eraserStrength: number;
	shape: Shape;
	layers: Layer[];
	scale: number;
	dpi: number;
	position: Coordinates;
};

export type Mode =
	| "select"
	| "draw"
	| "erase"
	| "shapes"
	| "eye_drop"
	| "zoom_in"
	| "zoom_out"
	| "move"
	| "undo"
	| "redo";
export type Shape = "rectangle" | "circle" | "triangle";
export type Coordinates = {
	x: number;
	y: number;
};
export type Layer = {
	name: string;
	id: ReturnType<typeof uuidv4>;
	active: boolean;
	hidden: boolean;
};
export type ShapeMode = {
	name: Shape;
	icon: string;
};
export type Shapes = ShapeMode[];
export type Modes = {
	name: Mode;
	icon: string;
	shortcut: string;
}[];
