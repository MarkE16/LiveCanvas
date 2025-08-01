import type {
	CanvasElement,
	Shape,
	CanvasState,
	Dimensions,
	Mode,
	Layer,
	Coordinates,
	HistoryAction,
	SavedCanvasProperties,
	CanvasElementType,
	RectProperties
} from "../types";

export type CanvasElementsStore = {
	elements: CanvasElement[];
	copiedElements: CanvasElement[];
	createElement: (
		type: CanvasElementType,
		properties?: Omit<
			Partial<CanvasElement>,
			"id" | "drawType" | "strokeWidth" | "opacity"
		>
	) => CanvasElement;
	changeElementProperties: (
		callback: (el: CanvasElement) => CanvasElement,
		predicate: (el: CanvasElement) => boolean
	) => void;
	deleteElement: (predicate: (el: CanvasElement) => boolean) => string[];
	setElements: (elements: CanvasElement[]) => void;
	copyElement: (predicate: (el: CanvasElement) => boolean) => void;
	pasteElement: () => void;
};

export type CanvasStore = CanvasState & {
	changeDimensions: (payload: Partial<Dimensions>) => void;
	changeColor: (payload: string) => void;
	changeOpacity: (payload: number) => void;
	changeMode: (payload: Mode) => void;
	changeShape: (payload: Shape) => void;
	changeShapeMode: (payload: "fill" | "stroke") => void;
	changeStrokeWidth: (payload: number) => void;
	changeDPI: (payload: number) => void;
	createLayer: (payload?: { name?: string; id?: string }) => void;
	deleteLayer: (payload: string) => void;
	toggleLayer: (payload: string) => void;
	toggleLayerVisibility: (payload: string) => void;
	moveLayerUp: (payload: string) => void;
	moveLayerDown: (payload: string) => void;
	renameLayer: (payload: { id: string; newName: string }) => void;
	removeLayer: (payload: string) => void;
	setLayers: (payload: Layer[]) => void;
	getActiveLayer: () => Layer;
	increaseScale: () => void;
	decreaseScale: () => void;
	setPosition: (payload: Partial<Coordinates>) => void;
	changeX: (payload: number) => void;
	changeY: (payload: number) => void;
	toggleReferenceWindow: () => void;
	prepareForSave: () => Promise<SavedCanvasProperties>;
	prepareForExport: (quality?: number) => Promise<Blob>;
	drawCanvas: (canvas: HTMLCanvasElement, layerId?: string) => void;
};

export type HistoryStore = {
	undoStack: HistoryAction[];
	redoStack: HistoryAction[];
	pushHistory: (action: HistoryAction) => void;
	undo: () => void;
	redo: () => void;
};

export type SliceStores = CanvasStore & CanvasElementsStore & HistoryStore;
