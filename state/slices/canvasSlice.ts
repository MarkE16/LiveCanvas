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
	Shape
} from "../../types";
import * as Utils from "../../lib/utils";

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

	function changeDrawStrength(payload: number) {
		set({
			drawStrength: Math.max(1, Math.min(15, payload))
		});
	}

	function changeEraserStrength(payload: number) {
		set({
			eraserStrength: Math.max(3, Math.min(10, payload))
		});
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
		const newLayers = layers.map((layer) => {
			if (layer.id === payload || layer.active) {
				layer.active = !layer.active;
			}
			return layer;
		});

		set({ layers: newLayers });
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

			const pendingLayer = state.layers.find((layer) => layer.id === payload)!;
			const newLayers = state.layers.filter(
				(layer) => layer.id !== pendingLayer.id
			);
			if (pendingLayer.active) {
				newLayers[0].active = true;
			}

			return { layers: newLayers };
		});
	}

	function setLayers(payload: Layer[]) {
		set({ layers: payload });
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
	async function prepareForSave(
		layerRefs: HTMLCanvasElement[]
	): Promise<SavedCanvasProperties> {
		if (!layerRefs.length)
			throw new Error(
				"Cannot export canvas: no references found. This is a bug."
			);

		const elements = get().elements;

		const layerPromises = layerRefs.map((layer, i) => {
			if (!layer) {
				throw new Error("Failed to get canvas when exporting.");
			}
			return new Promise<{
				name: string;
				image: Blob;
				position: number;
				id: string;
			}>((resolve) => {
				layer.toBlob((blob) => {
					if (!blob) throw new Error("Failed to extract blob when exporting.");
					resolve({
						name: layer.getAttribute("data-name") ?? "Untitled Layer",
						image: blob,
						position: i,
						id: layer.id
					});
				});
			});
		});
		const newElements = elements.map((element) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { focused, ...rest } = element;

			return rest;
		});

		const newLayers = await Promise.all(layerPromises);

		return { layers: newLayers, elements: newElements };
	}

	async function prepareForExport(
		layerRefs: HTMLCanvasElement[],
		quality: number = 1
	): Promise<Blob> {
		if (layerRefs.length === 0) {
			throw new Error("No layers provided when attempting to export.");
		}

		const elements = get().elements;
		const accountForDPI = true; // Consider DPI for better quality exports

		const substituteCanvas = document.createElement("canvas");
		const referenceLayer = layerRefs[0];
		const { width, height } = referenceLayer;
		const dpi = Number(referenceLayer.getAttribute("data-dpi"));
		// const scale = Number(referenceLayer.getAttribute("data-scale"));

		if (!dpi) {
			throw new Error(
				"Failed to get DPI from canvas when attempting to export."
			);
		}

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

		// Set white background
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, width, height);

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

		const promises = layerRefs.map((layer) => {
			return new Promise<void>((resolve) => {
				// Filter elements by layer ID
				const layerElements = elements.filter(
					(element) => element.layerId === layer.id
				);

				ctx.drawImage(layer, 0, 0);

				// Draw the elements
				layerElements.forEach((element) => {
					const { x: eX, y: eY, width: eWidth, height: eHeight } = element;

					const { x: startX, y: startY } = Utils.getCanvasPosition(
						eX,
						eY,
						layer
					);
					const { x: endX, y: endY } = Utils.getCanvasPosition(
						eX + eWidth,
						eY + eHeight,
						layer
					);

					const width = endX - startX;
					const height = endY - startY;

					ctx.fillStyle = element.fill ?? "";
					ctx.strokeStyle = element.stroke ?? "";

					ctx.beginPath();
					switch (element.type) {
						case "circle": {
							ctx.ellipse(
								startX + width / 2,
								startY + height / 2,
								width / 2,
								height / 2,
								0,
								0,
								2 * Math.PI
							);
							ctx.fill();
							ctx.stroke();
							break;
						}
						case "rectangle": {
							ctx.fillRect(startX, startY, width, height);
							ctx.strokeRect(startX, startY, width, height);
							break;
						}
						case "triangle": {
							ctx.moveTo(startX + width / 2, startY);
							ctx.lineTo(startX + width, startY + height);
							ctx.lineTo(startX, startY + height);
							ctx.fill();
							ctx.stroke();
							break;
						}
						case "text": {
							const text = element.text;
							if (!text?.content || !text.size) {
								throw new Error(
									`Failed to extract text from element with id ${element.id}.`
								);
							}

							ctx.font = `${text.size}px ${text.family}`;
							ctx.textBaseline = "top";
							const lines = generateTextLines(text.content, width, ctx);
							const lineHeight = 1.5;
							for (let i = 0; i < lines.length; i++) {
								const line = lines[i];
								ctx.fillText(
									line,
									startX,
									startY + i * text.size * lineHeight,
									width
								);
								ctx.strokeText(
									line,
									startX,
									startY + i * text.size * lineHeight,
									width
								);
							}
							break;
						}
						default: {
							ctx.closePath();
							throw new Error(`Invalid shape ${element.type} when exporting.`);
						}
					}
				});
				ctx.closePath();
				resolve();
			});
		});

		await Promise.all(promises);

		return new Promise((resolve) => {
			substituteCanvas.toBlob(
				(blob) => {
					if (!blob) throw new Error("Failed to extract blob when exporting.");
					resolve(blob);
				},
				"image/jpeg",
				quality
			);
		});
	}

	return {
		width: 400,
		height: 400,
		mode: "select",
		shape: "rectangle",
		color: "hsla(0, 0%, 0%, 1)",
		drawStrength: 5,
		eraserStrength: 3,
		layers: [{ name: "Layer 1", id: uuidv4(), active: true, hidden: false }],
		scale: 1,
		dpi: 1,
		position: { x: 0, y: 0 },
		changeDimensions,
		changeColor,
		changeColorAlpha,
		changeMode,
		changeShape,
		changeDrawStrength,
		changeEraserStrength,
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
		increaseScale,
		decreaseScale,
		setPosition,
		changeX,
		changeY,
		prepareForSave,
		prepareForExport
	};
};
