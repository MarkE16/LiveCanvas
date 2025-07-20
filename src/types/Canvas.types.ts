import { v4 as uuidv4 } from "uuid";

export type CanvasState = {
	width: number;
	height: number;
	mode: Mode;
	shape: Shape;
	color: string;
	drawStrength: number;
	eraserStrength: number;
	layers: Layer[];
  currentLayer: number;
	scale: number;
	dpi: number;
	position: Coordinates;
	referenceWindowEnabled: boolean;
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
export type Shapes = Shape[];
export type ToolbarMode = {
	name: Mode;
	shortcut: string;
};
export type Modes = ToolbarMode[];

export type ResizePosition = "nw" | "n" | "ne" | "w" | "e" | "sw" | "s" | "se";

export type CanvasElementType = Shape | "text";

export type FontProperties = {
	size: number;
	family: string;
	content: string;
};

export type CanvasElement = {
	x: number;
	y: number;
	width: number;
	height: number;
	type: CanvasElementType;
	fill: string;
	stroke: string;
	id: string;
	text?: FontProperties;
	layerId: string;
	focused: boolean;
	// More properties later...
};

export type Dimensions = {
	width: number;
	height: number;
};

export type SavedCanvasProperties = {
	layers: {
		name: string;
		image: Blob;
		position: number;
		id: string;
	}[];
	elements: Omit<CanvasElement, "focused">[];
};
