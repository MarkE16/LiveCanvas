import { parseColor } from "react-aria-components";
import { createSlice } from "@reduxjs/toolkit";
import * as UTILS from "../../utils";
import { v4 as uuidv4 } from "uuid";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Mode, Shape, Layer, Coordinates, CanvasState } from "../../types";

const initialState: CanvasState = {
	width: 400,
	height: 400,
	mode: "select",
	color: "hsla(0, 0%, 0%, 1)",
	drawStrength: 5,
	eraserStrength: 3,
	shape: "rectangle",
	layers: [{ name: "Layer 1", id: uuidv4(), active: true, hidden: false }],
	scale: 1,
	show_all: false,
	position: { x: 0, y: 0 }
};

const canvasSlice = createSlice({
	name: "canvas",
	initialState,
	reducers: {
		changeColor: (state, action: PayloadAction<string>) => {
			const space = parseColor(action.payload).getColorSpace();

			if (!space.includes("hsl")) {
				throw new Error(
					`Invalid color format passed into state. Pass in a valid HSL color string, not ${space}.`
				);
			}

			state.color = action.payload;
		},
		changeMode: (state, action: PayloadAction<Mode>) => {
			state.mode = action.payload;
		},
		changeShape: (state, action: PayloadAction<Shape>) => {
			state.shape = action.payload;
		},
		changeDrawStrength: (state, action: PayloadAction<number>) => {
			state.drawStrength = Math.min(15, Math.max(1, action.payload));
		},
		changeEraserStrength: (state, action: PayloadAction<number>) => {
			state.eraserStrength = Math.min(10, Math.max(3, action.payload));
		},
		createLayer: (
			state,
			action: PayloadAction<{ name?: string; id?: string } | undefined>
		) => {
			const newLayer = UTILS.createLayer(
				action.payload?.name,
				action.payload?.id
			);

			state.layers.push(newLayer);
		},
		removeLayer: (state, action: PayloadAction<string>) => {
			if (state.layers.length === 1) {
				return;
			}

			const pendingLayer = state.layers.find(
				(layer) => layer.id === action.payload
			)!;
			const newLayers = state.layers.filter(
				(layer) => layer.id !== pendingLayer.id
			);
			if (pendingLayer.active) {
				newLayers[0].active = true;
			}

			state.layers = newLayers;
		},
		toggleLayer: (state, action: PayloadAction<string>) => {
			state.layers = state.layers.map((layer) => {
				if (layer.id === action.payload || layer.active) {
					layer.active = !layer.active;
				}
				return layer;
			});
		},
		moveLayerUp: (state, action: PayloadAction<string>) => {
			const index = state.layers.findIndex(
				(layer) => layer.id === action.payload
			);

			state.layers = UTILS.swapElements(state.layers, index, index - 1);
		},
		moveLayerDown: (state, action: PayloadAction<string>) => {
			const index = state.layers.findIndex(
				(layer) => layer.id === action.payload
			);

			state.layers = UTILS.swapElements(state.layers, index, index + 1);
		},
		renameLayer: (
			state,
			action: PayloadAction<{ id: string; newName: string }>
		) => {
			state.layers = state.layers.map((layer) => {
				if (layer.id === action.payload.id) {
					layer.name = action.payload.newName;
				}
				return layer;
			});
		},
		setLayers: (state, action: PayloadAction<Layer[]>) => {
			state.layers = action.payload;
		},
		setLayerId: (
			state,
			action: PayloadAction<{
				id: string;
				newId: string;
			}>
		) => {
			state.layers = state.layers.map((layer) => {
				if (layer.id === action.payload.id) {
					layer.id = action.payload.newId;
				}
				return layer;
			});
		},
		toggleVisibility: (state, action: PayloadAction<string>) => {
			state.layers = state.layers.map((layer) => {
				if (layer.id === action.payload) {
					layer.hidden = !layer.hidden;
				}
				return layer;
			});
		},
		increaseScale: (state) => {
			state.scale = Math.min(3, state.scale + 0.1);
		},
		decreaseScale: (state) => {
			state.scale = Math.max(0.1, state.scale - 0.1);
		},
		setPosition: (state, action: PayloadAction<Partial<Coordinates>>) => {
			state.position = { ...state.position, ...action.payload };
		},
		changeX: (state, action: PayloadAction<number>) => {
			state.position.x += action.payload;
		},
		changeY: (state, action: PayloadAction<number>) => {
			state.position.y += action.payload;
		}
	}
});

export const {
	changeColor,
	changeMode,
	changeShape,
	changeDrawStrength,
	changeEraserStrength,
	createLayer,
	removeLayer,
	toggleLayer,
	moveLayerUp,
	moveLayerDown,
	renameLayer,
	setLayers,
	setLayerId,
	toggleVisibility,
	increaseScale,
	decreaseScale,
	setPosition,
	changeX,
	changeY
} = canvasSlice.actions;

export default canvasSlice.reducer;
