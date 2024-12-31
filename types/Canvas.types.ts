import { v4 as uuidv4 } from "uuid";

export type CanvasState = {
	width: number;
	height: number;
	mode: Mode;
	color: string;
	drawStrength: number;
	eraserStrength: number;
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
	| "text"
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
export type ToolbarMode = {
	name: Mode;
	shortcut: string;
};
export type Modes = ToolbarMode[];

export type ResizePosition = "nw" | "n" | "ne" | "w" | "e" | "sw" | "s" | "se";

export type CanvasElementType = Shape | "text";

export type CanvasElement = {
	x: number;
	y: number;
	width: number;
	height: number;
	type: CanvasElementType;
	fill: string;
	stroke: string;
	id: string;
	fontSize?: number;
	fontFamily?: string;
	fontContent?: string;
	layerId: string;
	focused: boolean;
	// More properties later...
};

export type Dimensions = {
	width: number;
	height: number;
};
