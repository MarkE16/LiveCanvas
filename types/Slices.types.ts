import type {
	CanvasElement,
	Shape,
	CanvasState,
	Dimensions,
	Mode,
	Layer,
	Coordinates,
	HistoryAction,
	SavedCanvasProperties
} from "../types";

export type CanvasElementsStore = {
	elements: CanvasElement[];
	copiedElements: CanvasElement[];
	elementMoving: boolean;
	focusElement: (...ids: string[]) => void;
	unfocusElement: (...ids: string[]) => void;
	createElement: (
		type: Shape | "text",
		properties?: Omit<Partial<CanvasElement>, "id">
	) => string;
	changeElementProperties: (
		callback: (el: CanvasElement) => CanvasElement,
		...ids: string[]
	) => void;
	deleteElement: (...ids: string[]) => void;
	updateMovingState: (state: boolean) => void;
	setElements: (elements: CanvasElement[]) => void;
	copyElement: (...ids: string[]) => void;
	pasteElement: () => void;
};

export type CanvasStore = CanvasState & {
	changeDimensions: (payload: Partial<Dimensions>) => void;
	changeColor: (payload: string) => void;
	changeColorAlpha: (payload: number) => void;
	changeMode: (payload: Mode) => void;
	changeShape: (payload: Shape) => void;
	changeDrawStrength: (payload: number) => void;
	changeEraserStrength: (payload: number) => void;
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
	increaseScale: () => void;
	decreaseScale: () => void;
	setPosition: (payload: Partial<Coordinates>) => void;
	changeX: (payload: number) => void;
	changeY: (payload: number) => void;
	prepareForSave: (
		layerRefs: HTMLCanvasElement[]
	) => Promise<SavedCanvasProperties>;
	prepareForExport: (
		layerRefs: HTMLCanvasElement[],
		quality?: number
	) => Promise<Blob>;
};

export type HistoryStore = {
	undoStack: HistoryAction[];
	redoStack: HistoryAction[];
	push: (action: HistoryAction) => void;
	undo: () => void;
	redo: () => void;
};

export type SliceStores = CanvasStore & CanvasElementsStore & HistoryStore;
export type SliceCreators = {
	canvas: CanvasStore;
	canvasElements: CanvasElementsStore;
	history: HistoryStore;
};
