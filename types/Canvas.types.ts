import { v4 as uuidv4 } from "uuid";

export type Mode =
	| "select"
	| "draw"
	| "erase"
	| "shapes"
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
