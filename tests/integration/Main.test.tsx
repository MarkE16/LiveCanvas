import {
	expect,
	beforeEach,
	beforeAll,
	afterAll,
	describe,
	it,
	vi,
	afterEach
} from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../test-utils";
import type { Color } from "react-aria-components";
import { parseColor } from "react-aria-components";
import Main from "../../components/Main/Main";
import { PropsWithChildren } from "react";

type MockProps = PropsWithChildren & {
	onChange?: (color: Color) => void;
};

const MOCK_COLOR = parseColor("#ff0000");

const stripUnits = (values: string[], unit: string) =>
	values.map((value) => Number(value.replace(unit, "")));

vi.mock("../../utils", async (importOriginal) => {
	const original = (await importOriginal()) as NonNullable<
		typeof importOriginal
	>;

	return {
		...original,
		generateCanvasImage: vi.fn()
	};
});

vi.mock("react-aria-components", async (importOriginal) => {
	const original = (await importOriginal()) as NonNullable<
		typeof importOriginal
	>;

	return {
		...original,
		// If the ColorThumb component is not mocked, an error related to useContext throws
		// and I'm not sure why. This is a workaround until the issue is identified.
		ColorThumb: () => <div data-testid="thumb" />,
		ColorArea: ({ onChange, children, ...props }: MockProps) => {
			return (
				<div
					data-testid="color-area"
					onClick={() => onChange && onChange(MOCK_COLOR)}
					{...props}
				>
					{children}
				</div>
			);
		}
	};
});

describe("Canvas Interactive Functionality", () => {
	let createObjectURLOriginal: typeof URL.createObjectURL;
	let revokeObjectURLOriginal: typeof URL.revokeObjectURL;
	const boundingClientRect: DOMRect = {
		x: 50,
		y: 64,
		width: 1364,
		height: 939,
		top: 64,
		right: 1414,
		bottom: 1003,
		left: 50,
		toJSON: vi.fn()
	};

	beforeEach(() => {
		renderWithProviders(<Main />);
	});

	beforeAll(() => {
		createObjectURLOriginal = URL.createObjectURL;
		revokeObjectURLOriginal = URL.revokeObjectURL;

		URL.createObjectURL = vi.fn(() => "blob:http://localhost:3000/1234");
		URL.revokeObjectURL = vi.fn();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	afterAll(() => {
		URL.createObjectURL = createObjectURLOriginal;
		URL.revokeObjectURL = revokeObjectURLOriginal;

		vi.restoreAllMocks();
	});

	it("should render the Main component", () => {
		expect(screen.getByRole("main")).toBeInTheDocument();
	});

	describe("Selection Functionality", () => {
		it("should be able to draw the selection rect when dragging south east", () => {
			const space = screen.getByTestId("canvas-container");
			const selectRect = screen.getByTestId("selection-rect");
			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			// When not dragging, the selection rect should not be visible.
			expect(selectRect).toBeInTheDocument();
			expect(selectRect).not.toBeVisible();

			// Now, we start dragging.
			const beforeX = 100;
			const beforeY = 100;
			const afterX = 200;
			const afterY = 200;

			// First, we need to click on the canvas to start the drag.
			// Note: the rect should still not be visible.

			fireEvent.mouseDown(space, {
				clientX: beforeX,
				clientY: beforeY,
				buttons: 1
			});

			expect(selectRect).not.toBeVisible();

			let { left, top, width, height } = selectRect.style;
			let stripped = stripUnits([left, top, width, height], "px");
			expect(stripped).toEqual([
				beforeX - boundingClientRect.left,
				beforeY - boundingClientRect.top,
				0,
				0
			]);

			expect(boundingRectMock).toHaveBeenCalled();

			// Now, let's move the mouse to create the selection rect.
			// Dev note: Do not forget to pass the buttons property to simulate a mouse click.
			// Most components implemented check this property to determine if the left
			// mouse button is pressed.
			fireEvent.mouseMove(document, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1
			});

			// The rect should be visible now.
			expect(selectRect).toBeVisible();

			// now, calculate the rect dimensions and position.
			// Note that because it is a testing environment, we cannot use
			// the getBoundingClientRect method to get the rect dimensions and position.
			// Instead, we will use the x, y, width, and height attributes of the rect element.
			left = selectRect.style.left;
			top = selectRect.style.top;
			width = selectRect.style.width;
			height = selectRect.style.height;

			stripped = stripUnits([left, top, width, height], "px");
			expect(stripped).toEqual([
				beforeX - boundingClientRect.left,
				beforeY - boundingClientRect.top,
				afterX - beforeX,
				afterY - beforeY
			]);

			expect(boundingRectMock).toHaveBeenCalledTimes(2);

			// Now, we release the mouse button.
			// The rect should disappear.

			fireEvent.mouseUp(document);
			expect(selectRect).not.toBeVisible();
		});

		it("should be able to draw the selection rect when dragging north east", () => {
			const space = screen.getByTestId("canvas-container");
			const selectRect = screen.getByTestId("selection-rect");
			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			// When not dragging, the selection rect should not be visible.
			expect(selectRect).toBeInTheDocument();
			expect(selectRect).not.toBeVisible();

			// Now, we start dragging.

			const beforeX = 100;
			const beforeY = 100;
			const afterX = 200;
			const afterY = 50;

			// First, we need to click on the canvas to start the drag.
			// Note: the rect should still not be visible.
			fireEvent.mouseDown(space, {
				clientX: beforeX,
				clientY: beforeY,
				buttons: 1
			});

			expect(selectRect).not.toBeVisible();

			let { left, top, width, height } = selectRect.style;

			let stripped = stripUnits([left, top, width, height], "px");
			expect(stripped).toEqual([
				beforeX - boundingClientRect.left,
				beforeY - boundingClientRect.top,
				0,
				0
			]);

			expect(boundingRectMock).toHaveBeenCalled();

			// Now, let's move the mouse to create the selection rect.
			fireEvent.mouseMove(document, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1
			});

			// The rect should be visible now.
			expect(selectRect).toBeVisible();

			// now, calculate the rect dimensions and position.
			left = selectRect.style.left;
			top = selectRect.style.top;
			width = selectRect.style.width;
			height = selectRect.style.height;

			stripped = stripUnits([left, top, width, height], "px");
			expect(stripped).toEqual([
				beforeX - boundingClientRect.left,
				afterY - boundingClientRect.top,
				afterX - beforeX,
				beforeY - afterY
			]);

			expect(boundingRectMock).toHaveBeenCalledTimes(2);

			// Now, we release the mouse button.
			fireEvent.mouseUp(document);
			expect(selectRect).not.toBeVisible();
		});

		it("should be able to draw the selection rect when dragging north west", () => {
			const space = screen.getByTestId("canvas-container");
			const selectRect = screen.getByTestId("selection-rect");
			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			// When not dragging, the selection rect should not be visible.
			expect(selectRect).toBeInTheDocument();
			expect(selectRect).not.toBeVisible();

			// Now, we start dragging.
			const beforeX = 100;
			const beforeY = 100;
			const afterX = 50;
			const afterY = 50;

			// First, we need to click on the canvas to start the drag.
			fireEvent.mouseDown(space, {
				clientX: beforeX,
				clientY: beforeY,
				buttons: 1
			});
			expect(selectRect).not.toBeVisible();

			let { left, top, width, height } = selectRect.style;

			let stripped = stripUnits([left, top, width, height], "px");
			expect(stripped).toEqual([
				beforeX - boundingClientRect.left,
				beforeY - boundingClientRect.top,
				0,
				0
			]);

			expect(boundingRectMock).toHaveBeenCalled();

			// Now, let's move the mouse to create the selection rect.
			fireEvent.mouseMove(document, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1
			});

			// The rect should be visible now.
			expect(selectRect).toBeVisible();

			// now, calculate the rect dimensions and position.
			left = selectRect.style.left;
			top = selectRect.style.top;
			width = selectRect.style.width;
			height = selectRect.style.height;

			stripped = stripUnits([left, top, width, height], "px");
			expect(stripped).toEqual([
				afterX - boundingClientRect.left,
				afterY - boundingClientRect.top,
				beforeX - afterX,
				beforeY - afterY
			]);

			expect(boundingRectMock).toHaveBeenCalledTimes(2);

			// Now, we release the mouse button.
			fireEvent.mouseUp(document);
			expect(selectRect).not.toBeVisible();
		});

		it("should be able to draw the selection rect when dragging south west", () => {
			const space = screen.getByTestId("canvas-container");
			const selectRect = screen.getByTestId("selection-rect");
			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			// When not dragging, the selection rect should not be visible.
			expect(selectRect).toBeInTheDocument();
			expect(selectRect).not.toBeVisible();

			// Now, we start dragging.
			const beforeX = 100;
			const beforeY = 100;
			const afterX = 50;
			const afterY = 200;

			// First, we need to click on the canvas to start the drag.
			fireEvent.mouseDown(space, {
				clientX: beforeX,
				clientY: beforeY,
				buttons: 1
			});

			let { left, top, width, height } = selectRect.style;
			let stripped = stripUnits([left, top, width, height], "px");
			expect(stripped).toEqual([
				beforeX - boundingClientRect.left,
				beforeY - boundingClientRect.top,
				0,
				0
			]);

			expect(selectRect).not.toBeVisible();
			expect(boundingRectMock).toHaveBeenCalled();

			// Now, let's move the mouse to create the selection rect.
			fireEvent.mouseMove(document, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1
			});

			// The rect should be visible now.
			expect(selectRect).toBeVisible();

			// now, calculate the rect dimensions and position.
			left = selectRect.style.left;
			top = selectRect.style.top;
			width = selectRect.style.width;
			height = selectRect.style.height;

			stripped = stripUnits([left, top, width, height], "px");
			expect(stripped).toEqual([
				afterX - boundingClientRect.left,
				beforeY - boundingClientRect.top,
				beforeX - afterX,
				afterY - beforeY
			]);

			expect(boundingRectMock).toHaveBeenCalledTimes(2);

			// Now, we release the mouse button.
			fireEvent.mouseUp(document);
			expect(selectRect).not.toBeVisible();
		});

		it("should not draw the selection rect if the mouse is not over the canvas", () => {
			// Note: The toolbar is not inside of the canvas space; therefore,
			// we can use the toolbar to simulate the mouse not being over the canvas.
			const toolbar = screen.getByTestId("left-toolbar-container");
			const selectRect = screen.getByTestId("selection-rect");
			const boundingRectMock = vi.spyOn(toolbar, "getBoundingClientRect");

			// When not dragging, the selection rect should not be visible.
			expect(selectRect).toBeInTheDocument();
			expect(selectRect).not.toBeVisible();

			// Now, we start dragging.
			const beforeX = 100;
			const beforeY = 100;
			const afterX = 200;
			const afterY = 200;

			// First, we need to click on the canvas to start the drag.
			fireEvent.mouseDown(toolbar, {
				clientX: beforeX,
				clientY: beforeY,
				buttons: 1
			});

			let { left, top, width, height } = selectRect.style;
			let stripped = stripUnits([left, top, width, height], "px");
			expect(stripped).toEqual([0, 0, 0, 0]);

			expect(selectRect).not.toBeVisible();

			// Now, let's move the mouse to create the selection rect.
			fireEvent.mouseMove(document, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1
			});

			left = selectRect.style.left;
			top = selectRect.style.top;
			width = selectRect.style.width;
			height = selectRect.style.height;

			stripped = stripUnits([left, top, width, height], "px");
			expect(stripped).toEqual([0, 0, 0, 0]);

			// The rect should not be visible.
			expect(selectRect).not.toBeVisible();

			expect(boundingRectMock).not.toHaveBeenCalled();

			// Now, we release the mouse button.
			fireEvent.mouseUp(document);
			expect(selectRect).not.toBeVisible();
		});

		it("should select an element", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			const space = screen.getByTestId("canvas-container");
			const selectRect = screen.getByTestId("selection-rect");
			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			const beforeX = 200;
			const beforeY = 200;

			// The rect should be larget enough to intersect with the element.
			const afterX = 350;
			const afterY = 500;

			const selectRectMock = vi
				.spyOn(selectRect, "getBoundingClientRect")
				.mockReturnValue({
					x: beforeX,
					y: beforeY,
					width: afterX - beforeX,
					height: afterY - beforeY,
					top: beforeY,
					right: afterX,
					bottom: afterY,
					left: beforeX,
					toJSON: vi.fn()
				});

			fireEvent.click(shapeTool);

			const option = screen.getByTestId("shape-rectangle");

			fireEvent.click(option);

			const elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(1);

			const [rect] = elements;

			expect(rect).toBeInTheDocument();
			expect(rect).toHaveAttribute("data-focused", "false");

			vi.spyOn(rect, "getBoundingClientRect").mockReturnValue({
				x: 270,
				y: 484,
				width: 100,
				height: 100,
				top: 484,
				right: 370,
				bottom: 584,
				left: 270,
				toJSON: vi.fn()
			});

			fireEvent.mouseDown(space, {
				clientX: beforeX,
				clientY: beforeY,
				buttons: 1
			});

			fireEvent.mouseMove(document, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1
			});

			fireEvent.mouseUp(document);

			expect(rect).toHaveAttribute("data-focused", "true");
			expect(boundingRectMock).toHaveBeenCalled();
			expect(selectRectMock).toHaveBeenCalled();
		});
	});

	describe("Moving canvas functionality", () => {
		it("should move the canvas with move tool", () => {
			const moveTool = screen.getByTestId("tool-move");
			const space = screen.getByTestId("canvas-container");
			const canvases = screen.queryAllByTestId("canvas-layer");
			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			expect(canvases).toHaveLength(1);

			const beforeX = 100;
			const beforeY = 100;
			const afterX = 200;
			const afterY = 200;

			// Verify that the canvas is in its default position.
			const canvas = canvases[0];
			expect(canvas).toBeInTheDocument();
			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");

			// First, we need to click on the tool and then click on the canvas to start the drag.

			fireEvent.click(moveTool);

			expect(moveTool.classList).toContain("active");

			fireEvent.mouseDown(space, {
				clientX: beforeX,
				clientY: beforeY,
				buttons: 1
			});

			// Now, let's move the mouse to move the canvas.
			fireEvent.mouseMove(document, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1
			});
			fireEvent.mouseUp(document);

			// The canvas should be moved.
			expect(canvas.style.transform).toBe(
				`translate(${afterX - beforeX}px, ${afterY - beforeY}px) scale(1)`
			);
			expect(boundingRectMock).toHaveBeenCalled();
		});

		it("should move the canvas with the shift key", () => {
			const space = screen.getByTestId("canvas-container");
			const canvases = screen.queryAllByTestId("canvas-layer");
			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			expect(canvases).toHaveLength(1);

			const beforeX = 100;
			const beforeY = 100;
			const afterX = 200;
			const afterY = 200;

			// Verify that the canvas is in its default position.
			const canvas = canvases[0];
			expect(canvas).toBeInTheDocument();
			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");

			fireEvent.keyDown(document, {
				shiftKey: true
			});

			// First, we need to click on the canvas to start the drag.
			fireEvent.mouseDown(space, {
				clientX: beforeX,
				clientY: beforeY,
				buttons: 1
			});

			// Now, let's move the mouse to move the canvas.
			fireEvent.mouseMove(document, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1
			});
			fireEvent.mouseUp(document);

			// The canvas should be moved.
			expect(canvas.style.transform).toBe(
				`translate(${afterX - beforeX}px, ${afterY - beforeY}px) scale(1)`
			);
			expect(boundingRectMock).toHaveBeenCalled();
		});
	});

	it("should not move the canvas when the mode is not move or shift key is held", () => {
		const space = screen.getByTestId("canvas-container");
		const canvases = screen.queryAllByTestId("canvas-layer");
		vi.spyOn(space, "getBoundingClientRect").mockReturnValue(
			boundingClientRect
		);

		expect(canvases).toHaveLength(1);

		const beforeX = 100;
		const beforeY = 100;
		const afterX = 200;
		const afterY = 200;

		// Verify that the canvas is in its default position.
		const canvas = canvases[0];
		expect(canvas).toBeInTheDocument();
		expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");

		fireEvent.mouseDown(space, {
			clientX: beforeX,
			clientY: beforeY,
			buttons: 1
		});

		// Now, let's move the mouse to move the canvas.
		fireEvent.mouseMove(document, {
			clientX: afterX,
			clientY: afterY,
			buttons: 1
		});
		fireEvent.mouseUp(document);

		// The canvas should not be moved.
		expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");
	});

	describe("Zoom functionality", () => {
		it("should zoom the canvas in and out using the toolbar button", () => {
			let toolButton = screen.getByTestId("tool-zoom_in");
			const space = screen.getByTestId("canvas-container");
			const canvases = screen.queryAllByTestId("canvas-layer");

			expect(canvases).toHaveLength(1);

			const canvas = canvases[0];
			expect(canvas).toBeInTheDocument();
			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");

			// First, let's zoom in.
			fireEvent.click(toolButton);
			expect(toolButton.classList).toContain("active");

			fireEvent.click(space);

			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1.1)");

			// Now, let's zoom out.
			toolButton = screen.getByTestId("tool-zoom_out");

			fireEvent.click(toolButton);
			expect(toolButton.classList).toContain("active");

			fireEvent.click(space);

			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");
		});

		it("should zoom the canvas in and out using the keyboard shortcuts", () => {
			const canvases = screen.queryAllByTestId("canvas-layer");

			expect(canvases).toHaveLength(1);

			const canvas = canvases[0];
			expect(canvas).toBeInTheDocument();
			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");

			fireEvent.keyDown(document, { key: "+" });

			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1.1)");

			fireEvent.keyDown(document, { key: "_" });

			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");
		});

		it("should zoom the canvas in and out using the mouse wheel with shift key held", () => {
			const space = screen.getByTestId("canvas-container");
			const canvases = screen.queryAllByTestId("canvas-layer");

			expect(canvases).toHaveLength(1);

			const canvas = canvases[0];
			expect(canvas).toBeInTheDocument();
			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");

			// Shift key must be held to zoom in and out with the mouse wheel.
			fireEvent.wheel(space, { deltaY: -100, shiftKey: true });

			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1.1)");

			fireEvent.wheel(space, { deltaY: 100, shiftKey: true });

			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");
		});

		it("should not zoom the canvas in and out using the mouse wheel without shift key held", () => {
			const space = screen.getByTestId("canvas-container");
			const canvases = screen.queryAllByTestId("canvas-layer");

			expect(canvases).toHaveLength(1);

			const canvas = canvases[0];
			expect(canvas).toBeInTheDocument();
			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");

			// Shift key must be held to zoom in and out with the mouse wheel.
			fireEvent.wheel(space, { deltaY: -100 });

			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");

			fireEvent.wheel(space, { deltaY: 100 });

			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");
		});
	});

	describe("LayerPreview functionality", () => {
		it.todo("renders the layer preview");
	});

	describe("Element functionality", () => {
		const exampleElementProperies = {
			x: NaN,
			y: NaN,
			width: 100,
			height: 100,
			fill: "#000000",
			stroke: "#000000"
		};
		it("should create a rectangle", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			let elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(0);

			fireEvent.click(shapeTool);

			const option = screen.getByTestId("shape-rectangle");

			fireEvent.click(option);

			elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(1);
			expect(elements[0]).toBeInTheDocument();
			expect(elements[0]).toHaveAttribute("data-type", "rectangle");
			for (const key in exampleElementProperies) {
				expect(elements[0]).toHaveAttribute(
					`data-${key}`,
					`${exampleElementProperies[key as keyof typeof exampleElementProperies]}`
				);
			}
		});

		it("should create a circle", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			let elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(0);

			fireEvent.click(shapeTool);

			const option = screen.getByTestId("shape-circle");

			fireEvent.click(option);

			elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(1);
			expect(elements[0]).toBeInTheDocument();
			expect(elements[0]).toHaveAttribute("data-type", "circle");
			for (const key in exampleElementProperies) {
				expect(elements[0]).toHaveAttribute(
					`data-${key}`,
					`${exampleElementProperies[key as keyof typeof exampleElementProperies]}`
				);
			}
		});

		it("should create a triangle", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			let elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(0);

			fireEvent.click(shapeTool);

			const option = screen.getByTestId("shape-triangle");

			fireEvent.click(option);

			elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(1);
			expect(elements[0]).toBeInTheDocument();
			expect(elements[0]).toHaveAttribute("data-type", "triangle");
			for (const key in exampleElementProperies) {
				expect(elements[0]).toHaveAttribute(
					`data-${key}`,
					`${exampleElementProperies[key as keyof typeof exampleElementProperies]}`
				);
			}
		});

		it("should focus an element on mouse down", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			let elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(0);

			fireEvent.click(shapeTool);

			const option = screen.getByTestId("shape-rectangle");

			fireEvent.click(option);

			elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(1);

			const element = elements[0];

			expect(element).toHaveAttribute("data-focused", "false");

			fireEvent.mouseDown(element, { buttons: 1 });

			expect(element).toHaveAttribute("data-focused", "true");

			fireEvent.mouseUp(document);

			// The element should still be focused.
			expect(element).toHaveAttribute("data-focused", "true");
		});

		it("should lose focus after clicking off the element", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			let elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(0);
			fireEvent.click(shapeTool);

			const option = screen.getByTestId("shape-rectangle");
			fireEvent.click(option);

			elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(1);

			const element = elements[0];
			expect(element).toHaveAttribute("data-focused", "false");

			fireEvent.mouseDown(element, { buttons: 1 });
			expect(element).toHaveAttribute("data-focused", "true");

			fireEvent.mouseDown(document);

			expect(element).toHaveAttribute("data-focused", "false");
		});

		it("should switch focus between different elements", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			let elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(0);
			fireEvent.click(shapeTool);

			const rectOption = screen.getByTestId("shape-rectangle");
			const circleOption = screen.getByTestId("shape-circle");

			fireEvent.click(rectOption);

			elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(1);

			const rect = elements[0];

			fireEvent.click(circleOption);

			elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(2);

			const circle = elements[1];

			expect(rect).toHaveAttribute("data-focused", "false");
			expect(circle).toHaveAttribute("data-focused", "false");

			fireEvent.mouseDown(rect, { buttons: 1 });

			expect(rect).toHaveAttribute("data-focused", "true");
			expect(circle).toHaveAttribute("data-focused", "false");

			fireEvent.mouseDown(circle, { buttons: 1 });

			expect(rect).toHaveAttribute("data-focused", "false");
			expect(circle).toHaveAttribute("data-focused", "true");

			fireEvent.mouseUp(circle);
		});

		it("should select multiple elements with ctrl key", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			let elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(0);

			fireEvent.click(shapeTool);

			const shapes = ["rectangle", "circle", "triangle"];

			for (let i = 0; i < shapes.length; i++) {
				const option = screen.getByTestId(`shape-${shapes[i]}`);

				fireEvent.click(option);

				elements = screen.queryAllByTestId("element");
				expect(elements).toHaveLength(i + 1);
			}

			const [rect, circle, triangle] = elements;

			fireEvent.mouseDown(rect, { ctrlKey: true, buttons: 1 });

			expect(rect).toHaveAttribute("data-focused", "true");
			expect(circle).toHaveAttribute("data-focused", "false");
			expect(triangle).toHaveAttribute("data-focused", "false");

			fireEvent.mouseUp(rect);
			fireEvent.mouseDown(circle, {
				ctrlKey: true,
				buttons: 1
			});

			expect(rect).toHaveAttribute("data-focused", "true");
			expect(circle).toHaveAttribute("data-focused", "true");
			expect(triangle).toHaveAttribute("data-focused", "false");

			fireEvent.mouseUp(circle);
			fireEvent.mouseDown(triangle, {
				ctrlKey: true,
				buttons: 1
			});

			expect(
				elements.every(
					(element) => element.getAttribute("data-focused") === "true"
				)
			).toBeTruthy();

			fireEvent.mouseDown(document);

			expect(
				elements.every(
					(element) => element.getAttribute("data-focused") === "false"
				)
			).toBeTruthy();
		});

		it("should delete an element with the delete key", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			let elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(0);

			fireEvent.click(shapeTool);

			const option = screen.getByTestId("shape-rectangle");

			fireEvent.click(option);

			elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(1);

			const element = elements[0];

			fireEvent.mouseDown(element, { buttons: 1 });

			expect(element).toHaveAttribute("data-focused", "true");

			fireEvent.keyDown(document, { key: "Delete" });

			elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(0);
		});

		it("should delete an element with the backspace key", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			let elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(0);

			fireEvent.click(shapeTool);

			const option = screen.getByTestId("shape-rectangle");

			fireEvent.click(option);

			elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(1);

			const element = elements[0];

			fireEvent.mouseDown(element, { buttons: 1 });

			expect(element).toHaveAttribute("data-focused", "true");

			fireEvent.keyDown(document, { key: "Backspace" });

			elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(0);
		});

		it("should not delete an element with the delete key if no element is focused", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			let elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(0);

			fireEvent.click(shapeTool);

			const option = screen.getByTestId("shape-rectangle");

			fireEvent.click(option);

			elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(1);

			fireEvent.keyDown(document, { key: "Delete" });

			elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(1);
		});

		it("should delete multiple elements", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			let elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(0);

			fireEvent.click(shapeTool);

			const shapes = ["rectangle", "circle", "triangle"];

			for (let i = 0; i < shapes.length; i++) {
				const option = screen.getByTestId(`shape-${shapes[i]}`);

				fireEvent.click(option);

				elements = screen.queryAllByTestId("element");
				expect(elements).toHaveLength(i + 1);
			}

			for (const element of elements) {
				fireEvent.mouseDown(element, {
					ctrlKey: true,
					buttons: 1
				});
			}

			expect(
				elements.every(
					(element) => element.getAttribute("data-focused") === "true"
				)
			).toBeTruthy();

			fireEvent.keyDown(document, { key: "Delete" });

			elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(0);
		});

		it("should copy and paste an element", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			let elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(0);

			fireEvent.click(shapeTool);

			const option = screen.getByTestId("shape-rectangle");

			fireEvent.click(option);

			elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(1);

			const element = elements[0];

			fireEvent.mouseDown(element, { buttons: 1 });

			expect(element).toHaveAttribute("data-focused", "true");

			fireEvent.keyDown(document, { key: "c", ctrlKey: true });

			fireEvent.keyDown(document, { key: "v", ctrlKey: true });

			elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(2);

			const [element1, element2] = elements;
			const el1X = Number(element1.getAttribute("data-x"));
			const el1Y = Number(element1.getAttribute("data-y"));
			const el1Width = element1.getAttribute("data-width");
			const el1Height = element1.getAttribute("data-height");

			expect(element2).toHaveAttribute("data-x", (el1X + 10).toString());
			expect(element2).toHaveAttribute("data-y", (el1Y + 10).toString());
			expect(element2).toHaveAttribute("data-width", el1Width);
			expect(element2).toHaveAttribute("data-height", el1Height);
		});

		it("should change the fill color of an element through hex field", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			let elements = screen.queryAllByTestId("element");
			let pickerButton = screen.queryByTestId("fill-picker-button");

			expect(elements).toHaveLength(0);
			expect(pickerButton).not.toBeInTheDocument();

			fireEvent.click(shapeTool);

			const option = screen.getByTestId("shape-rectangle");

			fireEvent.click(option);

			elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(1);

			const element = elements[0];

			// The color picker should be visible only when an element is focused.
			fireEvent.mouseDown(element, { buttons: 1 });

			const color = "#ff0000";
			pickerButton = screen.getByTestId("fill-picker-button");
			let popover = screen.queryByTestId("fill-picker-popover");

			expect(pickerButton).toBeInTheDocument();
			expect(popover).not.toBeInTheDocument();

			fireEvent.click(pickerButton);

			popover = screen.getByTestId("fill-picker-popover");
			expect(popover).toBeInTheDocument();

			const colorFieldDiv = screen.getByTestId("picker-field");

			const colorField = colorFieldDiv.lastChild;

			// Default color is black.
			expect(element).toHaveAttribute("data-fill", "#000000");

			fireEvent.change(colorField as Node, { target: { value: color } });

			// Color field is automatically converted to uppercase.
			// So, we need to convert the color to uppercase to compare.
			expect(element).toHaveAttribute("data-fill", color.toUpperCase());
		});

		it("should change the border color of an element through hex field", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			let elements = screen.queryAllByTestId("element");
			let pickerButton = screen.queryByTestId("stroke-picker-button");

			expect(elements).toHaveLength(0);
			expect(pickerButton).not.toBeInTheDocument();

			fireEvent.click(shapeTool);

			const option = screen.getByTestId("shape-rectangle");

			fireEvent.click(option);

			elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(1);

			const element = elements[0];

			// The color picker should be visible only when an element is focused.
			fireEvent.mouseDown(element, { buttons: 1 });

			const color = "#ff0000";
			pickerButton = screen.getByTestId("stroke-picker-button");
			let popover = screen.queryByTestId("stroke-picker-popover");

			expect(pickerButton).toBeInTheDocument();
			expect(popover).not.toBeInTheDocument();

			fireEvent.click(pickerButton);

			popover = screen.getByTestId("stroke-picker-popover");
			expect(popover).toBeInTheDocument();

			const colorFieldDiv = screen.getByTestId("picker-field");

			const colorField = colorFieldDiv.lastChild;

			// Default color is black.
			expect(element).toHaveAttribute("data-stroke", "#000000");

			fireEvent.change(colorField as Node, { target: { value: color } });

			// Color field is automatically converted to uppercase.
			// So, we need to convert the color to uppercase to compare.
			expect(element).toHaveAttribute("data-stroke", color.toUpperCase());
		});

		// Note: Since the color picker is a third-party component, we will
		// not test test whether the value of the color field is updated when
		// the color picker is used. So, we'll need to listen for whether
		// `changeElementProperties` is called with the correct parameters.
		it("should change fill color through color area", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			let elements = screen.queryAllByTestId("element");
			let pickerButton = screen.queryByTestId("fill-picker-button");

			expect(elements).toHaveLength(0);
			expect(pickerButton).not.toBeInTheDocument();

			fireEvent.click(shapeTool);

			const option = screen.getByTestId("shape-rectangle");

			fireEvent.click(option);

			elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(1);

			const element = elements[0];

			// The color picker should be visible only when an element is focused.
			fireEvent.mouseDown(element, { buttons: 1 });

			const color = "#ff0000";
			pickerButton = screen.getByTestId("fill-picker-button");
			let popover = screen.queryByTestId("fill-picker-popover");

			expect(pickerButton).toBeInTheDocument();
			expect(popover).not.toBeInTheDocument();

			fireEvent.click(pickerButton);

			popover = screen.getByTestId("fill-picker-popover");
			expect(popover).toBeInTheDocument();

			const colorArea = screen.getByTestId("picker-area");

			// Default color is black.
			expect(element).toHaveAttribute("data-fill", "#000000");

			// The color area should change the fill color of the element.
			fireEvent.click(colorArea);

			expect(element).toHaveAttribute("data-fill", color.toUpperCase());
		});

		it("should change the fill color for multiple focused elements", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			let elements = screen.queryAllByTestId("element");
			let pickerButton = screen.queryByTestId("fill-picker-button");

			expect(elements).toHaveLength(0);
			expect(pickerButton).not.toBeInTheDocument();
			fireEvent.click(shapeTool);

			const shapes = ["rectangle", "circle", "triangle"];

			for (let i = 0; i < shapes.length; i++) {
				const option = screen.getByTestId(`shape-${shapes[i]}`);

				fireEvent.click(option);

				elements = screen.queryAllByTestId("element");
				expect(elements).toHaveLength(i + 1);
			}

			for (const element of elements) {
				fireEvent.mouseDown(element, {
					ctrlKey: true,
					buttons: 1
				});
			}

			expect(
				elements.every(
					(element) => element.getAttribute("data-focused") === "true"
				)
			).toBeTruthy();

			const color = "#ff0000";
			pickerButton = screen.getByTestId("fill-picker-button");
			let popover = screen.queryByTestId("fill-picker-popover");

			expect(pickerButton).toBeInTheDocument();
			expect(popover).not.toBeInTheDocument();

			fireEvent.click(pickerButton);

			popover = screen.getByTestId("fill-picker-popover");
			expect(popover).toBeInTheDocument();

			const colorArea = screen.getByTestId("picker-area");

			// Default color is black.
			expect(
				elements.every(
					(element) => element.getAttribute("data-fill") === "#000000"
				)
			).toBe(true);

			fireEvent.click(colorArea);

			expect(
				elements.every(
					(element) => element.getAttribute("data-fill") === color.toUpperCase()
				)
			).toBe(true);
		});

		it.todo("should resize the element north", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			let elements = screen.queryAllByTestId("element");
			let resizeGrids = screen.queryAllByTestId("resize-grid");

			expect(elements).toHaveLength(0);
			expect(resizeGrids).toHaveLength(0);
			fireEvent.click(shapeTool);

			const option = screen.getByTestId("shape-rectangle");

			fireEvent.click(option);

			elements = screen.queryAllByTestId("element");
			resizeGrids = screen.queryAllByTestId("resize-grid");
			expect(elements).toHaveLength(1);
			expect(resizeGrids).toHaveLength(1);

			const element = elements[0];
			const resizeGrid = resizeGrids[0];

			expect(resizeGrid).not.toHaveAttribute("data-resizing");

			// First, we need to click on the element to focus it.
			fireEvent.mouseDown(element, {
				buttons: 1
			});

			const resizeHandle = screen.getByTestId("handle-n");

			fireEvent.mouseDown(resizeHandle, {
				clientX: 100,
				clientY: 100,
				buttons: 1
			});

			expect(element).toHaveAttribute(
				"data-height",
				exampleElementProperies.height.toString()
			);

			expect(resizeGrid).toHaveAttribute("data-resizing", "n");

			// Move upward.
			// The element should increase in height and decrease in y.

			fireEvent.mouseMove(document, {
				clientX: 100,
				clientY: 50,
				buttons: 1
			});

			expect(element).toHaveAttribute("data-height", "150");
		});
	});
});
