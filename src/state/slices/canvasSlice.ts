import type { StateCreator } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { parseColor } from "react-aria-components";
import type {
	Mode,
	Layer,
	Coordinates,
	Dimensions,
	CanvasStore,
	HistoryStore,
	CanvasElementsStore,
	SavedCanvasProperties,
	Shape,
	RectProperties
} from "@/types";
import * as Utils from "@/lib/utils";

export const createCanvasSlice: StateCreator<
	CanvasStore & HistoryStore & CanvasElementsStore,
	[],
	[],
	CanvasStore
> = (set, get) => {
	function changeDimensions(payload: Partial<Dimensions>) {
		set((state) => ({
			width: payload.width ?? state.width,
			height: payload.height ?? state.height
		}));
	}

	function changeColor(payload: string) {
		const space = parseColor(payload).getColorSpace();

		if (!space.includes("hsl")) {
			throw new Error(
				`Invalid color format passed into state. Pass in a valid HSL color string, not ${space}.`
			);
		}

		set({ color: payload });
	}

	function changeColorAlpha(payload: number) {
		set((state) => {
			const color = state.color;
			const newColorString =
				color.substring(0, color.lastIndexOf(",") + 1) +
				payload.toString() +
				")";

			return { color: newColorString };
		});
	}

	function changeMode(payload: Mode) {
		set({ mode: payload });
	}

	function changeShape(payload: Shape) {
		set({ shape: payload });
	}

	function changeShapeMode(payload: "fill" | "stroke") {
		set({ shapeMode: payload });
	}

	function changeStrokeWidth(payload: number) {
		set({ strokeWidth: payload });
	}

	function changeDPI(payload: number) {
		set({ dpi: payload });
	}

	function createLayer(payload?: { name?: string; id?: string }) {
		const layer = Utils.createLayer(payload?.name, payload?.id);

		set((state) => ({
			layers: [...state.layers, layer]
		}));
	}

	function deleteLayer(payload: string) {
		set((state) => ({
			layers: state.layers.filter((layer) => layer.id !== payload)
		}));
	}

	function toggleLayer(payload: string) {
		const layers = get().layers;
		let nextActiveLayerIndex = 0;
		const newLayers = layers.map((layer, i) => {
			if (layer.id === payload || layer.active) {
				layer.active = !layer.active;
			}

			if (layer.active) {
				nextActiveLayerIndex = i;
			}
			return layer;
		});

		set({ layers: newLayers, currentLayer: nextActiveLayerIndex });
	}

	function toggleLayerVisibility(payload: string) {
		const layers = get().layers;
		const newLayers = layers.map((layer) => {
			if (layer.id === payload) {
				layer.hidden = !layer.hidden;
			}
			return layer;
		});
		set({ layers: newLayers });
	}

	function moveLayerUp(payload: string) {
		const layers = get().layers;
		const index = layers.findIndex((layer) => layer.id === payload);
		const newLayers = Utils.swapElements(layers, index, index - 1);

		set({ layers: newLayers });
	}

	function moveLayerDown(payload: string) {
		const layers = get().layers;
		const index = layers.findIndex((layer) => layer.id === payload);
		const newLayers = Utils.swapElements(layers, index, index + 1);

		set({ layers: newLayers });
	}

	function renameLayer(payload: { id: string; newName: string }) {
		const layers = get().layers;
		const newLayers = layers.map((layer) => {
			if (layer.id === payload.id) {
				layer.name = payload.newName;
			}
			return layer;
		});

		set({ layers: newLayers });
	}

	function removeLayer(payload: string) {
		set((state) => {
			if (state.layers.length === 1) {
				return state;
			}

			let activeLayerIndex = 0;
			const pendingLayer = state.layers.find((layer, i) => {
				if (layer.id === payload) {
					activeLayerIndex = i;
				}
				return layer.id === payload;
			})!;
			const newLayers = state.layers.filter(
				(layer) => layer.id !== pendingLayer.id
			);
			if (pendingLayer.active) {
				newLayers[0].active = true;
				activeLayerIndex = 0;
			}

			return { layers: newLayers, currentLayer: activeLayerIndex };
		});
	}

	function setLayers(payload: Layer[]) {
		set({ layers: payload });
	}

	function getActiveLayer(): Layer {
		const { layers, currentLayer } = get();
		if (layers.length === 0) {
			throw new Error("No layers available to get the active layer.");
		}

		return layers[currentLayer];
	}

	function updateSelectionRect(payload: Partial<RectProperties> | null) {
		if (!payload) {
			set({ selection: null });
		} else {
			set((state) => ({
				selection: {
					x: payload.x ?? state.selection?.x ?? 0,
					y: payload.y ?? state.selection?.y ?? 0,
					width: payload.width ?? state.selection?.width ?? 0,
					height: payload.height ?? state.selection?.height ?? 0
				}
			}));
		}
	}

	function increaseScale() {
		set((state) => ({
			scale: Math.min(3, state.scale + 0.1)
		}));
	}

	function decreaseScale() {
		set((state) => ({
			scale: Math.max(0.1, state.scale - 0.1)
		}));
	}

	function setPosition(payload: Partial<Coordinates>) {
		set((state) => ({
			position: {
				x: payload.x ?? state.position.x,
				y: payload.y ?? state.position.y
			}
		}));
	}

	function changeX(payload: number) {
		set((state) => ({
			position: {
				x: state.position.x + payload,
				y: state.position.y
			}
		}));
	}

	function changeY(payload: number) {
		set((state) => ({
			position: {
				x: state.position.x,
				y: state.position.y + payload
			}
		}));
	}

	/**
	 * A function that prepares the canvas for saving
	 * by converting the canvas elements to blobs. Note
	 * that the elements are also saved, but they are
	 * processed internally, so they are not needed as
	 * an argument.
	 * @param layerRefs The array of layer references
	 * @returns A promise that resolves to the saved
	 * canvas properties. They are returned because the
	 * function does not have access to the useIndexed
	 * custom hook that is used to save the layers and
	 * elements. Therefore, the caller must save the
	 * layers and elements themselves.
	 */
	async function prepareForSave(): Promise<SavedCanvasProperties> {
		const { layers, elements } = get();

		return { layers, elements };
	}

	/**
	 * A helper function that returns an array of lines of the given text that fit within the given width.
	 * @param text The text to split into lines.
	 * @param width The width of the text container.
	 * @param ctx The 2D context of the canvas.
	 */
	function generateTextLines(
		text: string,
		width: number,
		ctx: CanvasRenderingContext2D
	): string[] {
		const lines: string[] = [];
		let charsLeft = text;

		while (charsLeft.length > 0) {
			let splitIndex = charsLeft.length;

			// Find the index to split the word at.
			while (
				ctx.measureText(charsLeft.slice(0, splitIndex)).width > width &&
				splitIndex > 0
			) {
				splitIndex--;
			}

			// Require one character.
			if (splitIndex === 0) {
				splitIndex = 1;
			}

			const splitWord = charsLeft.slice(0, splitIndex);

			// "Super long words" can contain new lines,
			// which can disrupt the word wrapping logic.
			// Therefore, we need to account for new lines.
			const hasNewLine = splitWord.indexOf("\n");

			if (hasNewLine !== -1) {
				lines.push(splitWord.slice(0, hasNewLine));
				charsLeft = charsLeft.slice(hasNewLine + 1);
			} else {
				lines.push(splitWord);
				charsLeft = charsLeft.slice(splitIndex);
			}
		}
		return lines;
	}

	async function prepareForExport(quality: number = 1): Promise<Blob> {
		const elements = get().elements;
		const accountForDPI = true; // Consider DPI for better quality exports

		const substituteCanvas = document.createElement("canvas");
		const { width, height, dpi } = get();

		substituteCanvas.width = width;
		substituteCanvas.height = height;

		const ctx = substituteCanvas.getContext("2d");
		if (!ctx) {
			throw new Error(
				"Failed to get 2D context from canvas when attempting to export."
			);
		}

		if (accountForDPI) {
			substituteCanvas.width *= dpi;
			substituteCanvas.height *= dpi;
			ctx.scale(dpi, dpi);
		}

		drawCanvas(substituteCanvas);

		return new Promise((resolve) => {
			requestAnimationFrame(() => {
				substituteCanvas.toBlob(
					(blob) => {
						if (!blob)
							throw new Error("Failed to extract blob when exporting.");
						resolve(blob);
					},
					"image/png",
					quality
				);
			});
		});
	}

	function toggleReferenceWindow() {
		set((state) => ({
			referenceWindowEnabled: !state.referenceWindowEnabled
		}));
	}

	function drawCanvas(canvas: HTMLCanvasElement, layerId?: string) {
		let elements = get().elements;
		const {
			background,
			layers,
			dpi,
			width: canvasWidth,
			height: canvasHeight
		} = get();

		const ctx = canvas.getContext("2d");
		if (!ctx) {
			throw new Error("Failed to get 2D context from canvas when drawing.");
		}

		const visibilityMap = new Map<string, boolean>();

		for (const layer of layers) {
			visibilityMap.set(layer.id, layer.hidden);
		}
		elements = elements.filter((element) => {
			if (layerId) {
				return element.layerId === layerId;
			}
			return !visibilityMap.get(element.layerId);
		});

		const canvasX = 0;
		const canvasY = 0;
		ctx.clearRect(canvasX, canvasY, canvas.width, canvas.height);

		const isPreviewCanvas = canvas.width < canvasWidth * dpi;

		if (isPreviewCanvas) {
			// If the canvas is a preview canvas, scale it down.
			const scale = canvas.width / (canvasWidth * dpi);
			// Save the current transform state.
			ctx.save();

			ctx.scale(scale, scale);
		}

		for (const element of elements) {
			const { x, y, width, height } = element;

			ctx.fillStyle = element.color;
			ctx.strokeStyle = element.color;
			ctx.lineWidth = element.strokeWidth;
			ctx.globalCompositeOperation =
				element.type === "eraser" ? "destination-out" : "source-over";
			ctx.lineCap = "round";

			switch (element.type) {
				case "brush":
				case "eraser": {
					ctx.beginPath();

					for (const [index, point] of element.path.entries()) {
						if (index === 0) {
							ctx.moveTo(point.x, point.y);
						} else {
							ctx.lineTo(point.x, point.y);
						}
					}
					ctx.stroke();
					ctx.closePath();
					break;
				}
				case "circle": {
					ctx.beginPath();
					ctx.ellipse(
						x + width / 2,
						y + height / 2,
						width / 2,
						height / 2,
						0,
						0,
						2 * Math.PI
					);
					if (element.drawType === "fill") {
						ctx.fill();
					} else {
						ctx.stroke();
					}
					break;
				}
				case "rectangle": {
					if (element.drawType === "fill") {
						ctx.fillRect(x, y, width, height);
					} else {
						ctx.strokeRect(x, y, width, height);
					}
					break;
				}

				case "triangle": {
					ctx.beginPath();
					if (element.inverted) {
						ctx.moveTo(x + width / 2, y + height);
						ctx.lineTo(x + width, y);
						ctx.lineTo(x, y);
					} else {
						ctx.moveTo(x + width / 2, y);
						ctx.lineTo(x + width, y + height);
						ctx.lineTo(x, y + height);
					}
					ctx.closePath();

					if (element.drawType === "fill") {
						ctx.fill();
					} else {
						ctx.stroke();
					}
					break;
				}
			}
		}

		// Finally, draw the background behind all elements.
		ctx.fillStyle = background;

		// 'destination-over' changes the way the background is drawn
		// by drawing behind existing content.
		ctx.globalCompositeOperation = "destination-over";
		ctx.fillRect(canvasX, canvasY, canvas.width, canvas.height);

		if (isPreviewCanvas) {
			ctx.restore(); // Restore the previous transform state.
		}
	}

	return {
		width: 400,
		height: 400,
		mode: "move",
		background: "white",
		shape: "rectangle",
		shapeMode: "fill",
		color: "hsla(0, 0%, 0%, 1)",
		strokeWidth: 5,
		layers: [{ name: "Layer 1", id: uuidv4(), active: true, hidden: false }],
		selection: null,
		currentLayer: 0,
		scale: 1,
		dpi: 1,
		position: { x: 0, y: 0 },
		referenceWindowEnabled: false,
		changeDimensions,
		changeColor,
		changeColorAlpha,
		changeMode,
		changeShape,
		changeShapeMode,
		changeStrokeWidth,
		changeDPI,
		createLayer,
		deleteLayer,
		toggleLayer,
		toggleLayerVisibility,
		moveLayerUp,
		moveLayerDown,
		renameLayer,
		removeLayer,
		setLayers,
		getActiveLayer,
		updateSelectionRect,
		increaseScale,
		decreaseScale,
		setPosition,
		changeX,
		changeY,
		prepareForSave,
		prepareForExport,
		toggleReferenceWindow,
		drawCanvas
	};
};
