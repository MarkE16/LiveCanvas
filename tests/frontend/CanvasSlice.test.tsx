import { describe, it, expect, vi } from "vitest";
import { v4 as uuidv4 } from "uuid";
import reducer, {
	changeMode,
	changeColor,
	changeDrawStrength,
	changeEraserStrength,
	changeShape,
	createLayer,
	removeLayer,
	increaseScale,
	decreaseScale
} from "../../state/slices/canvasSlice";

import type { Mode, Shape } from "../../types";

const mockState = {
	width: 400,
	height: 400,
	mode: "select" as Mode,
	color: "hsla(0, 0%, 0%, 1)", // TODO: Convert to using react-aria's parseColor
	drawStrength: 5,
	eraserStrength: 3,
	shape: "rectangle" as Shape,
	layers: [{ name: "Layer 1", id: uuidv4(), active: true, hidden: false }],
	scale: 1,
	show_all: false,
	position: { x: 0, y: 0 }
};

vi.mock("uuid", () => ({ v4: () => "1234-5678-9123-4567" }));

describe("Test dimensions", () => {
	it("should return the initial state", () => {
		const state = reducer(undefined, { type: "unknown" });

		expect(state.width).toBe(400);
		expect(state.height).toBe(400);
	});

	// TODO: Add more tests.
  it.todo("should properly update the width and height");
});

describe("Test mode", () => {
	it("should return the initial mode", () => {
		const state = reducer(undefined, { type: "unknown" });

		expect(state.mode).toBe("select");
	});

	it("should properly update to all existing modes", () => {
		const modes: Mode[] = [
			"draw",
			"erase",
			"shapes",
			"zoom_in",
			"zoom_out",
			"move"
		];

		for (const mode of modes) {
			const state = reducer(undefined, changeMode(mode));

			expect(state.mode).toBe(mode);
		}
	});
});

describe("Test color", () => {
	it("should return the initial color", () => {
		const state = reducer(undefined, { type: "unknown" });

		expect(state.color).toBe("hsla(0, 0%, 0%, 1)");
	});

	it("should properly update the color", () => {
		const colors = ["hsla(0, 0%, 0%, 0.5)", "hsla(120, 100%, 50%, 1)", "hsla(240, 100%, 50%, 1)"];
		
		for (const color of colors) {
			const state = reducer(undefined, changeColor(color));

			expect(state.color).toBe(color);
		}
	});

	it.todo("should not allow any other format that is not hsl/a");
});

describe("Test draw strength", () => {
	it("should return the initial draw strength", () => {
		const state = reducer(undefined, { type: "unknown" });

		expect(state.drawStrength).toBe(5);
	});

	it("should properly update the draw strength", () => {
		const state = reducer(undefined, changeDrawStrength(10));

		expect(state.drawStrength).toBe(10);
	});

	it("should not allow the draw strength to be outside 1-15", () => {
		const state = reducer(undefined, changeDrawStrength(20));

		expect(state.drawStrength).not.toBe(20);
		expect(state.drawStrength).toBe(15);

		const state2 = reducer(undefined, changeDrawStrength(0));

		expect(state2.drawStrength).not.toBe(0);
		expect(state2.drawStrength).toBe(1);
	});
});

describe("Test eraser strength", () => {
	it("should return the initial eraser strength", () => {
		const state = reducer(undefined, { type: "unknown" });

		expect(state.eraserStrength).toBe(3);
	});

	it("should properly update the eraser strength", () => {
		const state = reducer(undefined, changeEraserStrength(10));

		expect(state.eraserStrength).toBe(10);
	});

	it("should not allow the eraser strength to be outside 3-10", () => {
		const state = reducer(undefined, changeEraserStrength(20));

		expect(state.eraserStrength).not.toBe(20);
		expect(state.eraserStrength).toBe(10);

		const state2 = reducer(undefined, changeEraserStrength(2));

		expect(state2.eraserStrength).not.toBe(2);
		expect(state2.eraserStrength).toBe(3);
	});
});

describe("Test shape", () => {
	it("should return the initial shape", () => {
		const state = reducer(undefined, { type: "unknown" });

		expect(state.shape).toBe("rectangle");
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

		expect(state.layers).toEqual([
			{
				name: "Layer 1",
				id: "1234-5678-9123-4567",
				active: true,
				hidden: false
			}
		]);
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
});

describe("Test scale", () => {
	it("should return the initial scale", () => {
		const state = reducer(undefined, { type: "unknown" });

		expect(state.scale).toBe(1);
	});

	it("should increase the scale by 0.1", () => {
		const state = reducer(undefined, increaseScale());

    expect(state.scale).not.toBe(1);
		expect(state.scale).toBe(1.1);
	});

	it("should decrease the scale by 0.1", () => {
		const state = reducer(undefined, decreaseScale());

    expect(state.scale).not.toBe(1);
		expect(state.scale).toBe(0.9);
	});

	it("should not allow the scale to be outside 0.1-3", () => {
		let tempMockState = {
			...mockState,
			scale: 3
		};

		const state = reducer(tempMockState, increaseScale());

		expect(state.scale).not.toBe(3.1);
		expect(state.scale).toBe(3);

		tempMockState = {
			...mockState,
			scale: 0.1
		};

		const state2 = reducer(tempMockState, decreaseScale());

		expect(state2.scale).not.toBe(0);
		expect(state2.scale).toBe(0.1);
	});
});
