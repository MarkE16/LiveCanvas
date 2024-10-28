import { HTMLAttributes } from "react";

export type SelectionCanvasLayerProps = HTMLAttributes<HTMLCanvasElement> & {
	width: number;
	height: number;
	getActiveLayer: () => HTMLCanvasElement | undefined;
	xPosition?: number;
	yPosition?: number;
};

export type Coordinates = {
	x: number;
	y: number;
};
