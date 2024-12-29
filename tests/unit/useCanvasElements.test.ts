import {
	describe,
	it,
	vi,
	beforeEach,
	afterAll,
	afterEach,
	expect
} from "vitest";
import { renderHookWithProviders } from "../test-utils";
import type { RenderHookResult } from "@testing-library/react";
import useCanvasElements from "../../state/hooks/useCanvasElements";
import * as useLayerReferences from "../../state/hooks/useLayerReferences";

describe("useCanvasElements functionality", () => {
	let result: RenderHookResult<ReturnType<typeof useCanvasElements>, unknown>;
	let layerReferencesSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		const dummyCanvas = document.createElement("canvas");
		dummyCanvas.id = "123456789";
		dummyCanvas.classList.add("active");

		layerReferencesSpy = vi
			.spyOn(useLayerReferences, "default")
			.mockReturnValue([dummyCanvas]);

		result = renderHookWithProviders(useCanvasElements);
	});

	afterEach(() => {
		result.unmount();

		vi.clearAllMocks();
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	it("should return the inital values", () => {
		expect(result.result.current).toEqual({
			elements: [],
			focusElement: expect.any(Function),
			unfocusElement: expect.any(Function),
			createElement: expect.any(Function),
			deleteElement: expect.any(Function),
			changeElementProperties: expect.any(Function),
			copyElement: expect.any(Function),
			pasteElement: expect.any(Function),
			updateMovingState: expect.any(Function),
			movingElement: { current: false }
		});
	});

	it("should create one element with default properties", () => {
		expect(result.result.current.elements).toEqual([]);

		result.result.current.createElement("rectangle");

		result.rerender(); // Rerender to update the state.

		expect(result.result.current.elements).toEqual([
			{
				id: expect.any(String),
				layerId: expect.any(String),
				shape: "rectangle",
				x: NaN,
				y: NaN,
				width: 100,
				height: 100,
				fill: "#000000",
				border: "#000000",
				focused: false
			}
		]);
	});

	it("should create one element with given properties", () => {
		expect(result.result.current.elements).toEqual([]);

		result.result.current.createElement("rectangle", {
			x: 200,
			y: 200,
			width: 200,
			height: 200,
			fill: "#ff0000",
			border: "#ff0000"
		});

		result.rerender(); // Rerender to update the state.

		expect(result.result.current.elements).toEqual([
			{
				id: expect.any(String),
				layerId: expect.any(String),
				shape: "rectangle",
				x: 200,
				y: 200,
				width: 200,
				height: 200,
				fill: "#ff0000",
				border: "#ff0000",
				focused: false
			}
		]);
	});

	it("should create multiple elements with unique ids", () => {
		expect(result.result.current.elements).toEqual([]);

		result.result.current.createElement("rectangle");
		result.result.current.createElement("rectangle");
		result.result.current.createElement("rectangle");

		result.rerender();

		const [element1, element2, element3] = result.result.current.elements;

		expect(element1.id).not.toBe(element2.id);
		expect(element1.id).not.toBe(element3.id);
		expect(element2.id).not.toBe(element3.id);
	});

	it("should delete an element", () => {
		result.result.current.createElement("rectangle");
		result.rerender();

		expect(result.result.current.elements).toHaveLength(1);

		result.result.current.deleteElement(result.result.current.elements[0].id);
		result.rerender();

		expect(result.result.current.elements).toHaveLength(0);
	});

	it("should not delete anything if id doesn't exists", () => {
		expect(result.result.current.elements).toHaveLength(0);

		result.result.current.createElement("rectangle");
		result.rerender();

		expect(result.result.current.elements).toHaveLength(1);

		result.result.current.deleteElement("1");
		result.rerender();

		expect(result.result.current.elements).toHaveLength(1);
	});

	it("should focus an element", () => {
		result.result.current.createElement("rectangle");
		result.rerender();

		expect(result.result.current.elements[0].focused).toBe(false);

		result.result.current.focusElement(result.result.current.elements[0].id);
		result.rerender();

		expect(result.result.current.elements[0].focused).toBe(true);
	});

	it("should not focus an element if id doesn't exist", () => {
		result.result.current.createElement("rectangle");
		result.rerender();

		expect(result.result.current.elements[0].focused).toBe(false);

		result.result.current.focusElement("1");
		result.rerender();

		expect(result.result.current.elements[0].focused).toBe(false);
	});

	it("should unfocus an element", () => {
		result.result.current.createElement("rectangle");
		result.rerender();

		result.result.current.focusElement(result.result.current.elements[0].id);
		result.rerender();
		expect(result.result.current.elements[0].focused).toBe(true);

		result.result.current.unfocusElement(result.result.current.elements[0].id);
		result.rerender();
		expect(result.result.current.elements[0].focused).toBe(false);
	});

	it("should not unfocus an element if id doesn't exist", () => {
		result.result.current.createElement("rectangle");
		result.rerender();

		result.result.current.focusElement(result.result.current.elements[0].id);
		result.rerender();
		expect(result.result.current.elements[0].focused).toBe(true);

		result.result.current.unfocusElement("1");
		result.rerender();
		expect(result.result.current.elements[0].focused).toBe(true);
	});

	it("should change element properties", () => {
		result.result.current.createElement("rectangle");
		result.rerender();

		expect(result.result.current.elements[0].fill).toBe("#000000");

		result.result.current.changeElementProperties(
			(state) => ({
				...state,
				fill: "#ff0000"
			}),
			result.result.current.elements[0].id
		);
		result.rerender();

		expect(result.result.current.elements[0].fill).toBe("#ff0000");
	});

	it("should not change element properties if id doesn't exist", () => {
		result.result.current.createElement("rectangle");
		result.rerender();

		expect(result.result.current.elements[0].fill).toBe("#000000");

		result.result.current.changeElementProperties(
			(state) => ({
				...state,
				fill: "#ff0000"
			}),
			"1"
		);
		result.rerender();

		expect(result.result.current.elements[0].fill).toBe("#000000");
	});

	it("should copy and paste an unfocused element", () => {
		result.result.current.createElement("rectangle");
		result.rerender();

		expect(result.result.current.elements).toHaveLength(1);

		result.result.current.copyElement(result.result.current.elements[0].id);
		result.rerender();
		result.result.current.pasteElement();
		result.rerender();

		expect(result.result.current.elements).toHaveLength(2);
		const [element1, element2] = result.result.current.elements;

		expect(element2.x).toBe(element1.x + 10);
		expect(element2.y).toBe(element1.y + 10);
		expect(element2.id).not.toBe(element1.id);
		expect(element2.shape).toBe(element1.shape);
		expect(element2.width).toBe(element1.width);
		expect(element2.height).toBe(element1.height);
		expect(element2.fill).toBe(element1.fill);
		expect(element2.border).toBe(element1.border);
		expect(element2.focused).toBe(element1.focused);
	});

	it("should copy and paste a focused element", () => {
		result.result.current.createElement("rectangle");
		result.rerender();

		expect(result.result.current.elements).toHaveLength(1);

		result.result.current.focusElement(result.result.current.elements[0].id);
		result.rerender();

		result.result.current.copyElement(result.result.current.elements[0].id);
		result.rerender();
		result.result.current.pasteElement();
		result.rerender();

		expect(result.result.current.elements).toHaveLength(2);
		const [element1, element2] = result.result.current.elements;

		expect(element2.x).toBe(element1.x + 10);
		expect(element2.y).toBe(element1.y + 10);
		expect(element2.id).not.toBe(element1.id);
		expect(element2.shape).toBe(element1.shape);
		expect(element2.width).toBe(element1.width);
		expect(element2.height).toBe(element1.height);
		expect(element2.fill).toBe(element1.fill);
		expect(element2.border).toBe(element1.border);
		expect(element2.focused).toBe(element1.focused);
	});

	describe("useCanvasElements error cases", () => {
		beforeEach(() => {
			layerReferencesSpy.mockReturnValue([]);

			result = renderHookWithProviders(useCanvasElements);
		});

		it("should throw an error if no layer references exist when creating new element", () => {
			expect(() => result.result.current.createElement("circle")).toThrow(
				"Cannot create element: No existing layer."
			);

			expect(() =>
				result.result.current.createElement("circle", { x: 200, y: 200 })
			).toThrow("Cannot create element: No existing layer.");
		});
	});
});
