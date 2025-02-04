import type { StateCreator } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { parseColor } from "react-aria-components";
import type {
	Mode,
	Layer,
	Coordinates,
	Dimensions,
	CanvasStore
} from "../../types";
import * as Utils from "../../utils";

export const createCanvasSlice: StateCreator<
	CanvasStore,
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

	return {
		width: 400,
		height: 400,
		mode: "select",
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
		changeY
	};
};
