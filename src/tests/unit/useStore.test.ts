import { describe, it, expect, beforeEach, vi } from "vitest";
import { act } from "@testing-library/react";
import { renderHookWithProviders } from "../test-utils";
import type { RenderHookResult } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import useStore from "../../state/hooks/useStore";
import type { CanvasElement, HistoryAction, SliceStores } from "../../types";
import { MODES } from "../../state/store";
import { getCanvasPosition } from "../../lib/utils";

const exampleStore: SliceStores = {
	width: 400,
	height: 400,
	shape: "rectangle",
	mode: "select",
	drawStrength: 5,
	eraserStrength: 3,
	dpi: 1,
	color: "hsla(0, 0%, 0%, 1)",
	scale: 1,
	position: { x: 0, y: 0 },
	layers: [
		{ name: "Layer 1", id: expect.any(String), active: true, hidden: false }
	],
	elements: [],
	copiedElements: [],
	elementMoving: false,
	undoStack: [],
	redoStack: [],
	referenceWindowEnabled: false,
	changeMode: expect.any(Function),
	changeColor: expect.any(Function),
	setLayers: expect.any(Function),
	increaseScale: expect.any(Function),
	decreaseScale: expect.any(Function),
	setPosition: expect.any(Function),
	changeX: expect.any(Function),
	changeY: expect.any(Function),
	changeShape: expect.any(Function),
	changeDimensions: expect.any(Function),
	changeDPI: expect.any(Function),
	changeColorAlpha: expect.any(Function),
	changeDrawStrength: expect.any(Function),
	changeEraserStrength: expect.any(Function),
	moveLayerUp: expect.any(Function),
	moveLayerDown: expect.any(Function),
	createLayer: expect.any(Function),
	changeElementProperties: expect.any(Function),
	deleteElement: expect.any(Function),
	updateMovingState: expect.any(Function),
	undo: expect.any(Function),
	redo: expect.any(Function),
	deleteLayer: expect.any(Function),
	toggleLayer: expect.any(Function),
	toggleLayerVisibility: expect.any(Function),
	renameLayer: expect.any(Function),
	removeLayer: expect.any(Function),
	focusElement: expect.any(Function),
	unfocusElement: expect.any(Function),
	createElement: expect.any(Function),
	setElements: expect.any(Function),
	copyElement: expect.any(Function),
	pasteElement: expect.any(Function),
	push: expect.any(Function),
	toggleReferenceWindow: expect.any(Function),
	prepareForExport: expect.any(Function),
	prepareForSave: expect.any(Function)
};

describe("useStore functionality", () => {
	let result: RenderHookResult<SliceStores, unknown>;

	beforeEach(() => {
		result = renderHookWithProviders(() => useStore((state) => state));
	});

	it("should return the entire store", () => {
		expect(result.result.current).toEqual(exampleStore);
	});

	it("should throw if the hook is not under the StoreProvider", () => {
		const error = "useStore must be used within a StoreProvider";
		expect(() => renderHook(() => useStore((state) => state))).toThrowError(
			error
		);
	});

	describe("Canvas store functionality", () => {
		it("should return the appropriate selectors", () => {
			const result1 = renderHookWithProviders(() =>
				useStore((state) => state.width)
			);
			expect(result1.result.current).toBe(400);

			const result2 = renderHookWithProviders(() =>
				useStore((state) => state.elements)
			);
			expect(result2.result.current).toEqual([]);

			const result3 = renderHookWithProviders(() =>
				useStore((state) => state.createElement)
			);
			expect(result3.result.current).toEqual(expect.any(Function));
		});

		it("should change the dimensions to given values", () => {
			expect(result.result.current.width).toBe(400);
			expect(result.result.current.height).toBe(400);

			act(() => {
				result.result.current.changeDimensions({ width: 500, height: 500 });
			});

			expect(result.result.current.width).toBe(500);
			expect(result.result.current.height).toBe(500);
		});

		it("should not change a dimension if not provided", () => {
			expect(result.result.current.width).toBe(400);
			expect(result.result.current.height).toBe(400);

			act(() => {
				result.result.current.changeDimensions({ width: 500 });
			});

			expect(result.result.current.width).toBe(500);
			expect(result.result.current.height).toBe(400);

			act(() => {
				result.result.current.changeDimensions({ height: 500 });
			});

			expect(result.result.current.width).toBe(500);
			expect(result.result.current.height).toBe(500);

			act(() => {
				result.result.current.changeDimensions({});
			});

			expect(result.result.current.width).toBe(500);
			expect(result.result.current.height).toBe(500);
		});

		it("should return the initial mode", () => {
			expect(result.result.current.mode).toBe(exampleStore.mode);
		});

		it("should properly update to all existing modes", () => {
			for (const mode of MODES) {
				act(() => {
					result.result.current.changeMode(mode.name);
				});

				expect(result.result.current.mode).toBe(mode.name);
			}
		});

		it("should return the initial color", () => {
			expect(result.result.current.color).toBe(exampleStore.color);
		});

		it("should properly update the color", () => {
			const newColor = "hsla(170, 40%, 58%, 0.5)";
			act(() => {
				result.result.current.changeColor(newColor);
			});
			expect(result.result.current.color).toBe(newColor);
		});

		it("should throw if not given a hsl/a value", () => {
			const error =
				"Invalid color format passed into state. Pass in a valid HSL color string, not rgb.";

			const newColor = "rgb(255, 0, 0)";

			expect(() => {
				act(() => {
					result.result.current.changeColor(newColor);
				});
			}).toThrowError(error);
		});

		it("should return the initial draw strength", () => {
			expect(result.result.current.drawStrength).toBe(
				exampleStore.drawStrength
			);
		});

		it("should properly update the draw strength", () => {
			const newStrength = 10;
			act(() => {
				result.result.current.changeDrawStrength(newStrength);
			});
			expect(result.result.current.drawStrength).toBe(newStrength);
		});

		it("should not allow draw strength to be outside 1-15", () => {
			let newStrength = 20;
			act(() => {
				result.result.current.changeDrawStrength(newStrength);
			});
			expect(result.result.current.drawStrength).toBe(15);

			newStrength = 0;
			act(() => {
				result.result.current.changeDrawStrength(newStrength);
			});
			expect(result.result.current.drawStrength).toBe(1);
		});

		it("should return the initial eraser strength", () => {
			expect(result.result.current.eraserStrength).toBe(
				exampleStore.eraserStrength
			);
		});

		it("should properly update the eraser strength", () => {
			const newStrength = 10;
			act(() => {
				result.result.current.changeEraserStrength(newStrength);
			});
			expect(result.result.current.eraserStrength).toBe(newStrength);
		});

		it("should not allow eraser strength to be outside 3-10", () => {
			let newStrength = 20;
			act(() => {
				result.result.current.changeEraserStrength(newStrength);
			});
			expect(result.result.current.eraserStrength).toBe(10);

			newStrength = 2;
			act(() => {
				result.result.current.changeEraserStrength(newStrength);
			});
			expect(result.result.current.eraserStrength).toBe(3);
		});

		it("should return the initial layer", () => {
			expect(result.result.current.layers).toEqual(exampleStore.layers);
		});

		it("should create a new layer", () => {
			const newLayer = {
				name: "Layer 2",
				id: expect.any(String),
				active: false,
				hidden: false
			};
			act(() => {
				result.result.current.createLayer(newLayer);
			});
			expect(result.result.current.layers).toEqual([
				...exampleStore.layers,
				newLayer
			]);
		});

		it("should remove a layer when more than 1 layer", () => {
			// Push a new layer
			const newLayer = {
				name: "Layer 2",
				id: expect.any(String),
				active: false,
				hidden: false
			};

			act(() => {
				result.result.current.createLayer(newLayer);
			});

			// Remove the first layer
			const layerToRemove = result.result.current.layers[0];

			act(() => {
				result.result.current.removeLayer(layerToRemove.id);
			});

			newLayer.active = true; // Since there is only one layer, it should be active

			expect(result.result.current.layers).toEqual([newLayer]);
		});

		it("should not remove a layer if there is one layer", () => {
			const layerToRemove = result.result.current.layers[0];
			act(() => {
				result.result.current.removeLayer(layerToRemove.id);
			});
			expect(result.result.current.layers).toEqual(exampleStore.layers);
		});

		it("should not remove a layer if not found", () => {
			act(() => {
				result.result.current.removeLayer("1234-5678-9123-4567");
			});
			expect(result.result.current.layers).toEqual(exampleStore.layers);
		});

		it("should set layers to given payload", () => {
			const newLayers = [
				{
					name: "Layer 1",
					id: "1234-5678-9123-4567",
					active: true,
					hidden: false
				},
				{
					name: "Layer 3",
					id: "1234-5678-9123-4569",
					active: false,
					hidden: false
				}
			];
			act(() => {
				result.result.current.setLayers(newLayers);
			});
			expect(result.result.current.layers).toEqual(newLayers);
		});

		it("should return the inital scale", () => {
			expect(result.result.current.scale).toBe(exampleStore.scale);
		});

		it("should increase the scale by 0.1", () => {
			act(() => {
				result.result.current.increaseScale();
			});
			expect(result.result.current.scale).toBe(1.1);
		});

		it("should decrease the scale by 0.1", () => {
			act(() => {
				result.result.current.decreaseScale();
			});
			expect(result.result.current.scale).toBe(0.9);
		});

		it("should not allow scale to be less than 0.1", () => {
			// Decrease scale 10 times
			for (let i = 0; i < 10; i++) {
				act(() => {
					result.result.current.decreaseScale();
				});
			}
			expect(result.result.current.scale).toBe(0.1);
		});

		it("should not allow scale to be greater than 3", () => {
			// Increase scale 20 times
			for (let i = 0; i < 20; i++) {
				act(() => {
					result.result.current.increaseScale();
				});
			}
			expect(result.result.current.scale).toBe(3);
		});

		it("should return the initial position", () => {
			expect(result.result.current.position).toEqual(exampleStore.position);
		});

		it("should set the position to the given values", () => {
			act(() => {
				result.result.current.setPosition({ x: 10, y: 10 });
			});
			expect(result.result.current.position).toEqual({ x: 10, y: 10 });
		});

		it("should increase the X position by 5", () => {
			act(() => {
				result.result.current.changeX(5);
			});
			expect(result.result.current.position.x).toBe(5);
		});

		it("should decrease the X position by 5", () => {
			act(() => {
				result.result.current.changeX(-5);
			});
			expect(result.result.current.position.x).toBe(-5);
		});

		it("should increase the Y position by 5", () => {
			act(() => {
				result.result.current.changeY(5);
			});
			expect(result.result.current.position.y).toBe(5);
		});

		it("should decrease the Y position by 5", () => {
			act(() => {
				result.result.current.changeY(-5);
			});
			expect(result.result.current.position.y).toBe(-5);
		});

		it("should return the initial DPI", () => {
			expect(result.result.current.dpi).toBe(exampleStore.dpi);
		});

		it("should set the DPI to the given value", () => {
			act(() => {
				result.result.current.changeDPI(2);
			});
			expect(result.result.current.dpi).toBe(2);
		});

		it("should return json of layers and elements for saving", () => {
			const layers = [
				{
					name: "Layer 1",
					id: "1234-5678-9123-4567",
					image: expect.any(Blob),
					position: 0
				},
				{
					name: "Layer 3",
					id: "1234-5678-9123-4569",
					image: expect.any(Blob),
					position: 1
				}
			];
			const elements: CanvasElement[] = [
				{
					id: "1234-5678-9123-4567",
					type: "rectangle",
					x: 10,
					y: 10,
					width: 100,
					height: 100,
					fill: "#000000",
					stroke: "#000000",
					focused: false,
					layerId: "1234-5678-9123-4567"
				}
			];
			const layersAsCanvas = layers.map((layer) => {
				const canvas = document.createElement("canvas");
				canvas.width = 400;
				canvas.height = 400;
				canvas.id = layer.id;
				canvas.setAttribute("data-name", layer.name);
				return canvas;
			});
			const elementsWithoutFocused = elements.map((element) => {
				//eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { focused, ...rest } = element;
				return rest;
			});
			const expected = {
				layers,
				elements: elementsWithoutFocused
			};
			act(() => {
				result.result.current.setElements(elements);
			});
			expect(
				result.result.current.prepareForSave(layersAsCanvas)
			).resolves.toEqual(expected);
		});

		it("should return a blob for exporting", () => {
			const layers = [
				{
					name: "Layer 1",
					id: "1234-5678-9123-4567",
					image: expect.any(Blob),
					position: 0
				},
				{
					name: "Layer 3",
					id: "1234-5678-9123-4569",
					image: expect.any(Blob),
					position: 1
				}
			];
			const elements: CanvasElement[] = [
				{
					id: "1234-5678-9123-4567",
					type: "rectangle",
					x: 10,
					y: 10,
					width: 100,
					height: 100,
					fill: "#000000",
					stroke: "#000000",
					focused: false,
					layerId: "1234-5678-9123-4567"
				}
			];
			const layersAsCanvas = layers.map((layer) => {
				const canvas = document.createElement("canvas");
				canvas.width = 400;
				canvas.height = 400;
				canvas.id = layer.id;
				canvas.setAttribute("data-name", layer.name);
				canvas.setAttribute("data-dpi", "1");
				return canvas;
			});
			act(() => {
				result.result.current.setElements(elements);
			});
			expect(
				result.result.current.prepareForExport(layersAsCanvas)
			).resolves.toEqual(expect.any(Blob));
		});

		it("should render the elements in the correct positions relative to the canvas", async () => {
			const mockCanvasBoundingClientRect: DOMRect = {
				x: 110.5,
				y: 175.3333282470703,
				width: 400,
				height: 400,
				top: 175.3333282470703,
				right: 510.5,
				bottom: 575.3333282470703,
				left: 110.5,
				toJSON: vi.fn()
			};
			const canvas = document.createElement("canvas");
			const subCanvas = document.createElement("canvas");
			canvas.width = 400;
			canvas.height = 400;
			canvas.id = "1234-5678-9123-4567";
			canvas.setAttribute("data-name", "Layer 1");
			canvas.setAttribute("data-dpi", "1");

			const elements: CanvasElement[] = [
				{
					id: "1234-5678-9123-4567",
					type: "rectangle",
					x: 10,
					y: 10,
					width: 100,
					height: 100,
					fill: "#000000",
					stroke: "#000000",
					focused: false,
					layerId: "1234-5678-9123-4567"
				},
				{
					id: "1234-5678-9123-4568",
					type: "circle",
					x: 20,
					y: 20,
					width: 100,
					height: 100,
					fill: "#000000",
					stroke: "#000000",
					focused: false,
					layerId: "1234-5678-9123-4567"
				},
				{
					id: "1234-5678-9123-4569",
					type: "triangle",
					x: 30,
					y: 30,
					width: 100,
					height: 100,
					fill: "#000000",
					stroke: "#000000",
					focused: false,
					layerId: "1234-5678-9123-4567"
				}
			];

			const ctx = subCanvas.getContext("2d");

			if (!ctx) {
				throw new Error("Canvas context not found.");
			}

			vi.spyOn(document, "createElement").mockReturnValue(subCanvas);
			vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue(
				mockCanvasBoundingClientRect
			);

			const strokeSpy = vi.spyOn(ctx, "stroke");
			const fillSpy = vi.spyOn(ctx, "fill");
			const strokeRectSpy = vi.spyOn(ctx, "strokeRect");
			const fillRectSpy = vi.spyOn(ctx, "fillRect");
			const lineToSpy = vi.spyOn(ctx, "lineTo");
			const moveToSpy = vi.spyOn(ctx, "moveTo");
			const ellipseSpy = vi.spyOn(ctx, "ellipse");

			act(() => {
				result.result.current.setElements(elements);
			});

			await result.result.current.prepareForExport([canvas]);

			for (const element of elements) {
				const { x, y, width, height, type } = element;
				const { x: startX, y: startY } = getCanvasPosition(x, y, canvas);
				const { x: endX, y: endY } = getCanvasPosition(
					x + width,
					y + height,
					canvas
				);

				const realWidth = endX - startX;
				const realHeight = endY - startY;

				switch (type) {
					case "rectangle":
						expect(strokeRectSpy).toHaveBeenCalledWith(
							startX,
							startY,
							realWidth,
							realHeight
						);
						expect(fillRectSpy).toHaveBeenCalledWith(
							startX,
							startY,
							realWidth,
							realHeight
						);
						break;
					case "circle":
						expect(ellipseSpy).toHaveBeenCalledWith(
							startX + realWidth / 2,
							startY + realHeight / 2,
							realWidth / 2,
							realHeight / 2,
							0,
							0,
							Math.PI * 2
						);
						break;
					case "triangle":
						expect(moveToSpy).toHaveBeenCalledWith(
							startX + realWidth / 2,
							startY
						);
						expect(lineToSpy).toHaveBeenCalledWith(
							startX + realWidth,
							startY + realHeight
						);
						expect(lineToSpy).toHaveBeenCalledWith(startX, startY + realHeight);
						break;
					default:
						break;
				}
			}

			expect(strokeRectSpy).toHaveBeenCalledTimes(1);
			// FillRect is called twice because the canvas is drawn a white background first.
			// Then, any rectangles are drawn on top of that.
			expect(fillRectSpy).toHaveBeenCalledTimes(2);
			expect(fillSpy).toHaveBeenCalledTimes(2);
			expect(strokeSpy).toHaveBeenCalledTimes(2);
		});

		it("should throw if not given layers to save", () => {
			expect(() => result.result.current.prepareForSave([])).rejects.toThrow();
		});

		it("should throw if not given layers to export", () => {
			expect(() =>
				result.result.current.prepareForExport([])
			).rejects.toThrow();
		});
	});

	describe("History store functionality", () => {
		it("should return the initial history stacks", () => {
			expect(result.result.current.undoStack).toEqual(exampleStore.undoStack);
			expect(result.result.current.redoStack).toEqual(exampleStore.redoStack);
		});

		it("should push to the history", () => {
			const action: HistoryAction = {
				mode: "draw",
				color: "hsla(0, 0%, 0%, 1)",
				drawStrength: 5,
				path: [],
				width: 400,
				height: 400,
				layerId: "1234-5678-9123-4567"
			};
			act(() => {
				result.result.current.push(action);
			});
			expect(result.result.current.undoStack).toEqual([action]);
			expect(result.result.current.redoStack).toEqual([]);
		});

		it("should undo the last action", () => {
			const action: HistoryAction = {
				mode: "draw",
				color: "hsla(0, 0%, 0%, 1)",
				drawStrength: 5,
				path: [],
				width: 400,
				height: 400,
				layerId: "1234-5678-9123-4567"
			};

			act(() => {
				result.result.current.push(action);
				result.result.current.undo();
			});

			expect(result.result.current.undoStack).toEqual([]);
			expect(result.result.current.redoStack).toEqual([action]);
		});

		it("should redo the last action", () => {
			const action: HistoryAction = {
				mode: "draw",
				color: "hsla(0, 0%, 0%, 1)",
				drawStrength: 5,
				path: [],
				width: 400,
				height: 400,
				layerId: "1234-5678-9123-4567"
			};

			act(() => {
				result.result.current.push(action);
				result.result.current.undo();
				result.result.current.redo();
			});

			expect(result.result.current.undoStack).toEqual([action]);
			expect(result.result.current.redoStack).toEqual([]);
		});

		it("should not undo if there are no actions", () => {
			act(() => {
				result.result.current.undo();
			});
			expect(result.result.current.undoStack).toEqual([]);
			expect(result.result.current.redoStack).toEqual([]);
		});

		it("should not redo if there are no actions", () => {
			act(() => {
				result.result.current.redo();
			});
			expect(result.result.current.undoStack).toEqual([]);
			expect(result.result.current.redoStack).toEqual([]);
		});
	});

	describe("Element store functionality", () => {
		it("should return the initial elements", () => {
			expect(result.result.current.elements).toEqual(exampleStore.elements);
		});

		it("should create one shape element with default properties", () => {
			act(() => {
				result.result.current.createElement("rectangle", {
					layerId: "1234-5678-9123-4567"
				});
			});
			expect(result.result.current.elements).toEqual([
				{
					id: expect.any(String),
					type: "rectangle",
					x: NaN,
					y: NaN,
					width: 100,
					height: 100,
					fill: "#000000",
					stroke: "#000000",
					focused: false,
					layerId: "1234-5678-9123-4567"
				}
			]);
		});

		it("should create one shape element with pre-filled properties", () => {
			const element: CanvasElement = {
				id: expect.any(String),
				type: "rectangle",
				x: 10,
				y: 10,
				width: 100,
				height: 100,
				fill: "#000000",
				stroke: "#000000",
				focused: false,
				layerId: "1234-5678-9123-4567"
			};
			act(() => {
				result.result.current.createElement("rectangle", element);
			});
			expect(result.result.current.elements).toEqual([element]);
		});

		it("should create one text element with text properties", () => {
			const element: CanvasElement = {
				id: expect.any(String),
				type: "text",
				x: 10,
				y: 10,
				width: 100,
				height: 100,
				fill: "#000000",
				stroke: "#000000",
				focused: false,
				layerId: "1234-5678-9123-4567",
				text: {
					size: 16,
					family: "Arial",
					content: "Text"
				}
			};
			act(() => {
				result.result.current.createElement("text", element);
			});
			expect(result.result.current.elements).toEqual([element]);
		});

		it("should create elements with unique ids", () => {
			act(() => {
				result.result.current.createElement("rectangle", {
					layerId: "1234-5678-9123-4567"
				});
				result.result.current.createElement("circle", {
					layerId: "1234-5678-9123-4567"
				});
			});
			const [one, two] = result.result.current.elements;

			expect(one.id).not.toBe(two.id);
		});

		it("should delete an element", () => {
			act(() => {
				result.result.current.createElement("rectangle", {
					layerId: "1234-5678-9123-4567"
				});
			});
			expect(result.result.current.elements).toHaveLength(1);
			
      const [element] = result.result.current.elements;

			act(() => {
				result.result.current.deleteElement(
					el => el.id === element.id
				);
			});

			expect(result.result.current.elements).toHaveLength(0);
		});

		it("should not delete anything if id doesn't exist", () => {
			act(() => {
				result.result.current.createElement("rectangle", {
					layerId: "1234-5678-9123-4567"
				});
			});
			expect(result.result.current.elements).toHaveLength(1);

			act(() => {
				result.result.current.deleteElement(el => el.id === '1');
			});

			expect(result.result.current.elements).toHaveLength(1);
		});

		it("should focus an element", () => {
			act(() => {
				result.result.current.createElement("rectangle", {
					layerId: "1234-5678-9123-4567"
				});
			});
			let element = result.result.current.elements[0];
			expect(element.focused).toBe(false);

			act(() => {
				result.result.current.focusElement(el => el.id === element.id);
			});

			element = result.result.current.elements[0];

			expect(element.focused).toBe(true);
		});

		it("should not focus an element if id doesn't exist", () => {
			act(() => {
				result.result.current.createElement("rectangle", {
					layerId: "1234-5678-9123-4567"
				});
			});
			let element = result.result.current.elements[0];
			expect(element.focused).toBe(false);

			act(() => {
				result.result.current.focusElement(el => el.id === "1");
			});

			element = result.result.current.elements[0];

			expect(element.focused).toBe(false);
		});

		it("should unfocus an element", () => {
			act(() => {
				result.result.current.createElement("rectangle", {
					layerId: "1234-5678-9123-4567"
				});
			});
			let element = result.result.current.elements[0];

			act(() => {
				result.result.current.focusElement(el => el.id === element.id);
			});

			element = result.result.current.elements[0];
			expect(element.focused).toBe(true);

			act(() => {
				result.result.current.unfocusElement(el => el.id === element.id);
			});

			element = result.result.current.elements[0];
			expect(element.focused).toBe(false);
		});

		it("should not unfocus an element if id doesn't exist", () => {
			act(() => {
				result.result.current.createElement("rectangle", {
					layerId: "1234-5678-9123-4567"
				});
			});

			let element = result.result.current.elements[0];

			act(() => {
				result.result.current.focusElement(el => el.id === element.id);
			});

			element = result.result.current.elements[0];
			expect(element.focused).toBe(true);

			act(() => {
				result.result.current.unfocusElement(el => el.id === '1');
			});

			element = result.result.current.elements[0];
			expect(element.focused).toBe(true);
		});

		it("should change element properties", () => {
			act(() => {
				result.result.current.createElement("rectangle", {
					layerId: "1234-5678-9123-4567"
				});
			});

			let element = result.result.current.elements[0];
			expect(element.stroke).toBe("#000000");

			act(() => {
				result.result.current.changeElementProperties(
					(state) => ({
						...state,
						stroke: "#ffffff"
					}),
					el => el.id === element.id
				);
			});

			element = result.result.current.elements[0];
			expect(element.stroke).toBe("#ffffff");
		});

		it("should not change element properties if id doesn't exist", () => {
			act(() => {
				result.result.current.createElement("rectangle", {
					layerId: "1234-5678-9123-4567"
				});
			});

			let element = result.result.current.elements[0];
			expect(element.stroke).toBe("#000000");

			act(() => {
				result.result.current.changeElementProperties(
					(state) => ({
						...state,
						stroke: "#ffffff"
					}),
					el => el.id === '1'
				);
			});

			element = result.result.current.elements[0];
			expect(element.stroke).toBe("#000000");
		});

		it("should copy and paste an unfocused element", () => {
			act(() => {
				result.result.current.createElement("rectangle", {
					layerId: "1234-5678-9123-4567"
				});
			});

			const element = result.result.current.elements[0];
			expect(result.result.current.copiedElements).toEqual([]);

			act(() => {
				result.result.current.copyElement(el => el.id === element.id);
			});

			expect(result.result.current.copiedElements).toEqual([element]);

			act(() => {
				result.result.current.pasteElement();
			});

			const newElement = {
				...element,
				x: element.x + 10,
				y: element.y + 10,
				id: expect.any(String)
			};

			expect(result.result.current.elements).toEqual([element, newElement]);
			expect(result.result.current.copiedElements).toEqual([newElement]);
		});

		it("should copy and paste a focused element", () => {
			act(() => {
				result.result.current.createElement("rectangle", {
					layerId: "1234-5678-9123-4567"
				});
			});

			let element = result.result.current.elements[0];
			expect(result.result.current.copiedElements).toEqual([]);

			act(() => {
				result.result.current.focusElement(el => el.id === element.id);
				result.result.current.copyElement(el => el.id === element.id);
			});

			element = result.result.current.elements[0];

			expect(result.result.current.copiedElements).toEqual([element]);

			act(() => {
				result.result.current.pasteElement();
			});

			const newElement = {
				...element,
				x: element.x + 10,
				y: element.y + 10,
				id: expect.any(String)
			};

			expect(result.result.current.elements).toEqual([element, newElement]);
			expect(result.result.current.copiedElements).toEqual([newElement]);
		});

		it("should throw if a layerId is not provided when creating element", () => {
			const error = "Cannot create element: No existing layer.";
			expect(() => {
				act(() => {
					result.result.current.createElement("rectangle");
				});
			}).toThrowError(error);
		});

		it("should throw if text properties are not provided when creating text element", () => {
			const error =
				"Cannot create text element without additional text properties.";
			expect(() => {
				act(() => {
					result.result.current.createElement("text", {
						layerId: "1234-5678-9123-4567"
					});
				});
			}).toThrowError(error);
		});
	});
});
