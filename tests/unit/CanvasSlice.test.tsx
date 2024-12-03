import { parseColor } from "react-aria-components";
import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import reducer, {
	changeDimensions,
	changeMode,
	changeColor,
	changeDrawStrength,
	changeEraserStrength,
	changeShape,
	createLayer,
	removeLayer,
	increaseScale,
	decreaseScale,
	setPosition,
	changeX,
	changeY
} from "../../state/slices/canvasSlice";
import { MODES } from "../../state/store";

import type { CanvasState, Shape } from "../../types";

const mockState: CanvasState = {
	width: 400,
	height: 400,
	mode: "select",
	color: parseColor("hsla(0, 0%, 0%, 1)").toString(), // TODO: Convert to using react-aria's parseColor
	drawStrength: 5,
	eraserStrength: 3,
	dpi: 1,
	shape: "rectangle",
	layers: [{ name: "Layer 1", id: uuidv4(), active: true, hidden: false }],
	scale: 1,
	position: { x: 0, y: 0 }
};

vi.mock("uuid", () => ({ v4: () => "1234-5678-9123-4567" }));

describe("Test dimensions", () => {
	it("should return the initial state", () => {
		const state = reducer(undefined, { type: "unknown" });

		expect(state.width).toBe(mockState.width);
		expect(state.height).toBe(mockState.height);
	});

	it("should properly update the dimensions", () => {
		const state = reducer(
			undefined,
			changeDimensions({ width: 800, height: 600 })
		);

		expect(state.width).toBe(800);
		expect(state.height).toBe(600);
	});
});

describe("Test mode", () => {
	it("should return the initial mode", () => {
		const state = reducer(undefined, { type: "unknown" });

		expect(state.mode).toBe(mockState.mode);
	});

	it("should properly update to all existing modes", () => {
		for (const mode of MODES) {
			const state = reducer(undefined, changeMode(mode.name));

			expect(state.mode).toBe(mode.name);
		}
	});
});

describe("Test color", () => {
	it("should return the initial color", () => {
		const state = reducer(undefined, { type: "unknown" });

		expect(state.color).toBe(mockState.color);
	});

	it("should properly update the color", () => {
		const colors = [
			"hsla(0, 0%, 0%, 0.5)",
			"hsla(120, 100%, 50%, 1)",
			"hsla(240, 100%, 50%, 1)"
		];

		for (const color of colors) {
			const state = reducer(undefined, changeColor(color));

			expect(state.color).toBe(color);
		}
	});

	it("should not allow any other format that is not hsl/a", () => {
		const error =
			"Invalid color format passed into state. Pass in a valid HSL color string, not rgb.";
		expect(() => reducer(undefined, changeColor("rgb(0, 0, 0)"))).toThrow(
			error
		);

		expect(() => reducer(undefined, changeColor("rgba(0, 0, 0, 0.5)"))).toThrow(
			error
		);

		expect(() => reducer(undefined, changeColor("#000"))).toThrow(error);
	});
});

describe("Test draw strength", () => {
	it("should return the initial draw strength", () => {
		const state = reducer(undefined, { type: "unknown" });

		expect(state.drawStrength).toBe(mockState.drawStrength);
	});

	it("should properly update the draw strength", () => {
		const state = reducer(undefined, changeDrawStrength(10));

		expect(state.drawStrength).toBe(10);
	});

	it("should not allow the draw strength to be outside 1-15", () => {
		const state = reducer(undefined, changeDrawStrength(20));

		expect(state.drawStrength).toBe(15);

		const state2 = reducer(undefined, changeDrawStrength(0));

		expect(state2.drawStrength).toBe(1);
	});
});

describe("Test eraser strength", () => {
	it("should return the initial eraser strength", () => {
		const state = reducer(undefined, { type: "unknown" });

		expect(state.eraserStrength).toBe(mockState.eraserStrength);
	});

	it("should properly update the eraser strength", () => {
		const state = reducer(undefined, changeEraserStrength(10));

		expect(state.eraserStrength).toBe(10);
	});

	it("should not allow the eraser strength to be outside 3-10", () => {
		const state = reducer(undefined, changeEraserStrength(20));

		expect(state.eraserStrength).toBe(10);

		const state2 = reducer(undefined, changeEraserStrength(2));

		expect(state2.eraserStrength).toBe(3);
	});
});

describe("Test shape", () => {
	it("should return the initial shape", () => {
		const state = reducer(undefined, { type: "unknown" });

		expect(state.shape).toBe(mockState.shape);
	});

	it("should properly update the shape", () => {
		const shapes: Shape[] = ["rectangle", "circle", "triangle"];

		for (const shape of shapes) {
			const state = reducer(undefined, changeShape(shape));

			expect(state.shape).toBe(shape);
		}
	});
});

describe("Test layer", () => {
	it("should return the initial layer", () => {
		const state = reducer(undefined, { type: "unknown" });

		expect(state.layers).toEqual(mockState.layers);
	});

	it("should create a new layer", () => {
		const state = reducer(
			mockState,
			createLayer({ name: "New Layer", id: "9876-54321-0987-6543" })
		);

		expect(state.layers.length).toBe(2);
		expect(state.layers).toEqual([
			{
				name: "Layer 1",
				id: "1234-5678-9123-4567",
				active: true,
				hidden: false
			},
			{
				name: "New Layer",
				id: "9876-54321-0987-6543",
				active: false,
				hidden: false
			}
		]);
	});

	it("should remove a layer", () => {
		const tempMockState = {
			...mockState,
			layers: [
				...mockState.layers,
				{
					name: "Layer 2",
					id: "1234-5678-9123-4568",
					active: false,
					hidden: false
				},
				{
					name: "Layer 3",
					id: "1234-5678-9123-4569",
					active: false,
					hidden: false
				}
			]
		};
		const state = reducer(tempMockState, removeLayer("1234-5678-9123-4568"));

		expect(state.layers.length).toBe(2);
		expect(state.layers).toEqual([
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
		]);

		const state2 = reducer(tempMockState, removeLayer("1234-5678-9123-4567"));

		expect(state2.layers.length).toBe(2);
		expect(state2.layers).toEqual([
			{
				name: "Layer 2",
				id: "1234-5678-9123-4568",
				active: true,
				hidden: false
			},
			{
				name: "Layer 3",
				id: "1234-5678-9123-4569",
				active: false,
				hidden: false
			}
		]);

		const state3 = reducer(tempMockState, removeLayer("1234-5678-9123-4569"));

		expect(state3.layers.length).toBe(2);
		expect(state3.layers).toEqual([
			{
				name: "Layer 1",
				id: "1234-5678-9123-4567",
				active: true,
				hidden: false
			},
			{
				name: "Layer 2",
				id: "1234-5678-9123-4568",
				active: false,
				hidden: false
			}
		]);
	});

	it("should not remove any layer if not found", () => {
		const state = reducer(mockState, removeLayer("1234-5678-9123-4568"));

		expect(state.layers).toEqual(mockState.layers);
	});
});

describe("Test scale", () => {
	it("should return the initial scale", () => {
		const state = reducer(undefined, { type: "unknown" });

		expect(state.scale).toBe(1);
	});

	it("should increase the scale by 0.1", () => {
		const state = reducer(undefined, increaseScale());

		expect(state.scale).toBe(1.1);
	});

	it("should decrease the scale by 0.1", () => {
		const state = reducer(undefined, decreaseScale());

		expect(state.scale).toBe(0.9);
	});

	it("should not allow the scale to be outside 0.1-3", () => {
		let tempMockState = {
			...mockState,
			scale: 3
		};

		const state = reducer(tempMockState, increaseScale());

		expect(state.scale).toBe(3);

		tempMockState = {
			...mockState,
			scale: 0.1
		};

		const state2 = reducer(tempMockState, decreaseScale());

		expect(state2.scale).toBe(0.1);
	});
});

describe("Test position", () => {
	it("should return the initial position", () => {
		const state = reducer(undefined, { type: "unknown" });

		expect(state.position).toEqual(mockState.position);
	});

	it("should update the position", () => {
		const newPosition = { x: 10, y: 10 };
		const state = reducer(undefined, setPosition(newPosition));

		expect(state.position).toEqual(newPosition);
	});

	describe("Test changing X position", () => {
		it("should increase the X position by 5", () => {
			const state = reducer(undefined, changeX(5));

			expect(state.position).toEqual({ x: 5, y: 0 });
		});

		it("should decrease the X position by 5", () => {
			const state = reducer(undefined, changeX(-5));

			expect(state.position).toEqual({ x: -5, y: 0 });
		});
	});

	describe("Test changing Y position", () => {
		it("should increase the Y position by 5", () => {
			const state = reducer(undefined, changeY(5));

			expect(state.position).toEqual({ x: 0, y: 5 });
		});

		it("should decrease the Y position by 5", () => {
			const state = reducer(undefined, changeY(-5));

			expect(state.position).toEqual({ x: 0, y: -5 });
		});
	});
});
