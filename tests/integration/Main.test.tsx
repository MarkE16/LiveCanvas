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
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithProviders } from "../test-utils";
import type { Color } from "react-aria-components";
import { parseColor } from "react-aria-components";
import Main from "../../components/Main/Main";
import { PropsWithChildren } from "react";
import { CanvasStore } from "../../types";

type MockProps = PropsWithChildren & {
	onChange?: (color: Color) => void;
};

const MOCK_COLOR = parseColor("#ff0000");

const stripUnits = (values: string[], unit: string) =>
	values.map((value) => Number(value.replace(unit, "")));

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
	const mockLayer: Partial<CanvasStore> = {
		layers: [
			{
				id: "1",
				name: "Layer 1",
				active: true,
				hidden: false
			}
		],
		changeColor: vi.fn(),
		prepareForExport: vi.fn().mockResolvedValue(new Blob())
	};

	beforeEach(() => {
		renderWithProviders(<Main />, {
			preloadedState: mockLayer
		});
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
			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			const beforeX = 200;
			const beforeY = 200;

			// The rect should be larget enough to intersect with the element.
			const afterX = 350;
			const afterY = 500;

			fireEvent.click(shapeTool);

			// By default, we are creating a rectangle.
			// We need to click and drag to create the rectangle.
			// Note: since we want to be able to make a selection rectangle
			// despite the fact we are in the shape tool, we use the ctrl key
			// to indicate that we are creating a shape.
			// We fire the keyDown event on the document to simulate the ctrl
			// key being held down. We do this because the pane reads the
			// key from a state variable that is updated when the keyDown event
			// is fired on the document.
			fireEvent.keyDown(document, { ctrlKey: true });
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

			const elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(1);

			const [rect] = elements;

			expect(rect).toBeInTheDocument();
			expect(rect).toHaveAttribute("data-focused", "false");

			// We're not making the shape anymore, so we release the ctrl key.
			// This will enable us to select the element.
			fireEvent.keyUp(document, { ctrlKey: false });

			vi.spyOn(rect, "getBoundingClientRect").mockReturnValue({
				x: 270,
				y: 350,
				width: 100,
				height: 100,
				top: 350,
				right: 370,
				bottom: 540,
				left: 270,
				toJSON: vi.fn()
			});

			const selectRect = screen.getByTestId("selection-rect");
			const selectRectMock = vi
				.spyOn(selectRect, "getBoundingClientRect")
				.mockReturnValue({
					x: 250,
					y: 330,
					width: 150,
					height: 150,
					top: 330,
					right: 400,
					bottom: 480,
					left: 250,
					toJSON: vi.fn()
				});

			fireEvent.mouseDown(space, {
				clientX: 250,
				clientY: 330,
				buttons: 1
			});

			fireEvent.mouseMove(document, {
				clientX: 400,
				clientY: 480,
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
			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");

			// Shift key must be held to zoom in and out with the mouse wheel.
			fireEvent.wheel(space, { deltaY: -100 });

			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");

			fireEvent.wheel(space, { deltaY: 100 });

			expect(canvas.style.transform).toBe("translate(0px, 0px) scale(1)");
		});
	});

	describe("LayerPreview functionality", () => {
		it("renders the layer preview with a div by default", () => {
			const div = screen.getByTestId("preview-1");

			expect(div).toBeInTheDocument();
			expect(div).toBeInstanceOf(HTMLDivElement);
		});

		it("should update to an image when imageupdate is fired", async () => {
			const createObjectSpy = vi.spyOn(URL, "createObjectURL");
			const revokeObjectSpy = vi.spyOn(URL, "revokeObjectURL");
			const dummyCanvas = document.createElement("canvas");
			dummyCanvas.id = "1";

			const event = new CustomEvent("imageupdate", {
				detail: {
					layer: dummyCanvas
				}
			});

			await act(async () => {
				fireEvent(document, event);
			});

			const layer = screen.getByTestId("preview-1");

			expect(createObjectSpy).toHaveBeenCalledWith(expect.any(Blob));
			expect(layer).toBeInstanceOf(HTMLImageElement);
			expect(layer).toHaveAttribute("src", "blob:http://localhost:3000/1234"); // From the mocked URL.createObjectURL

			// Assume the image is loaded. In this case, we want to revoke the object URL to free memory.
			fireEvent.load(layer);

			expect(revokeObjectSpy).toHaveBeenCalledWith(
				"blob:http://localhost:3000/1234"
			);
		});

		it("should not update the image if not the same layer id", async () => {
			const createObjectSpy = vi.spyOn(URL, "createObjectURL");
			const dummyCanvas = document.createElement("canvas");
			dummyCanvas.id = "2";

			const event = new CustomEvent("imageupdate", {
				detail: {
					layer: dummyCanvas
				}
			});

			await act(async () => {
				fireEvent(document, event);
			});

			const layer = screen.getByTestId("preview-1");
			expect(layer).toBeInstanceOf(HTMLDivElement);
			expect(createObjectSpy).not.toHaveBeenCalled();
		});
	});

	describe("Canvas functionality", () => {
		const canvasBoundingClientRect: DOMRect = {
			x: 149.5,
			y: 334,
			width: 400,
			height: 400,
			top: 334,
			right: 549.5,
			bottom: 734,
			left: 149.5,
			toJSON: vi.fn()
		};

		it("should render a canvas layer", () => {
			const canvas = screen.queryByTestId("canvas-layer");

			expect(canvas).toBeInTheDocument();
			expect(canvas).toBeInstanceOf(HTMLCanvasElement);
			expect(canvas).toHaveAttribute("width", "400");
			expect(canvas).toHaveAttribute("height", "400");
			expect(canvas).toHaveClass("active");
			expect(canvas).not.toHaveClass("hidden");
		});

		it("should draw a line", () => {
			const drawTool = screen.getByTestId("tool-draw");
			let pointerMarker = screen.queryByTestId("canvas-pointer-marker");
			const canvas = screen.getByTestId("canvas-layer") as HTMLCanvasElement;
			const ctx = canvas.getContext("2d");

			expect(pointerMarker).not.toBeInTheDocument();

			fireEvent.click(drawTool);

			pointerMarker = screen.getByTestId("canvas-pointer-marker");

			expect(pointerMarker).not.toBeVisible();

			if (!ctx) throw new Error("Canvas context not found");

			const mockMoveTo = vi.fn();
			const mockLineTo = vi.fn();

			const mockPath2D = {
				moveTo: mockMoveTo,
				lineTo: mockLineTo
			};

			vi.spyOn(global, "Path2D").mockImplementation(
				() => mockPath2D as unknown as Path2D
			);
			vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue(
				canvasBoundingClientRect
			);
			const dispatchEventMock = vi.spyOn(document, "dispatchEvent");
			// We need to mock the stroke method to avoid errors where the original
			// stroke method will throw if the passed argument is not a Path2D object.
			const mockStroke = vi.spyOn(ctx, "stroke").mockImplementation(vi.fn());

			const beforeX = 100;
			const beforeY = 100;
			const afterX = 200;
			const afterY = 200;

			fireEvent.mouseDown(canvas, {
				clientX: beforeX,
				clientY: beforeY,
				buttons: 1
			});

			fireEvent.mouseMove(canvas, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1
			});

			expect(mockStroke).toHaveBeenCalledWith(mockPath2D);
			expect(mockMoveTo).toHaveBeenCalledWith(beforeX - 149.5, beforeY - 334);
			expect(mockLineTo).toHaveBeenCalledWith(afterX - 149.5, afterY - 334);
			fireEvent.mouseUp(canvas);

			const event = new CustomEvent("imageupdate", {
				detail: {
					layer: canvas
				}
			});

			expect(dispatchEventMock).toHaveBeenLastCalledWith(event);
		});

		it("should erase a section of the canvas", () => {
			const eraseTool = screen.getByTestId("tool-erase");
			const canvas = screen.getByTestId("canvas-layer") as HTMLCanvasElement;
			const ctx = canvas.getContext("2d");

			vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue(
				canvasBoundingClientRect
			);

			fireEvent.click(eraseTool);

			if (!ctx) throw new Error("Canvas context not found");

			const mockClearRect = vi
				.spyOn(ctx, "clearRect")
				.mockImplementation(vi.fn());

			const afterX = 200;
			const afterY = 200;

			const dispatchEventMock = vi.spyOn(document, "dispatchEvent");
			fireEvent.mouseDown(canvas, { buttons: 1 });
			fireEvent.mouseMove(canvas, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1
			});

			// width and height = eraser_radius * eraser_strength
			// width and height = 7 * 3 = 21
			expect(mockClearRect).toHaveBeenCalledWith(
				afterX - 149.5 - 21 / 2,
				afterX - 334 - 21 / 2,
				21,
				21
			);
			fireEvent.mouseUp(canvas);

			const event = new CustomEvent("imageupdate", {
				detail: {
					layer: canvas
				}
			});

			expect(dispatchEventMock).toHaveBeenLastCalledWith(event);
		});

		it("should change the color based on the eye drop tool", () => {
			const selectTool = screen.getByTestId("tool-select");
			const eyeDropTool = screen.getByTestId("tool-eye_drop");
			const canvas = screen.getByTestId("canvas-layer") as HTMLCanvasElement;

			fireEvent.click(eyeDropTool);

			expect(selectTool).not.toHaveClass("active");

			const ctx = canvas.getContext("2d");

			if (!ctx) throw new Error("Canvas context not found");

			vi.spyOn(ctx, "getImageData").mockReturnValue({
				data: new Uint8ClampedArray([255, 0, 0, 255]),
				width: 1,
				height: 1,
				colorSpace: "srgb"
			});

			fireEvent.mouseDown(canvas, { buttons: 1 });

			expect(mockLayer.changeColor).toHaveBeenCalledWith(
				MOCK_COLOR.toString("hsla")
			);
			// After the color is changed, the eye drop tool should be deactivated
			// and the select tool should be activated.
			expect(selectTool).toHaveClass("active");
		});
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
		const { x, y, width, height, left, top } = boundingClientRect;
		const elementCenterX =
			x + width / 2 - exampleElementProperies.width / 2 - left;
		const elementCenterY =
			y + height / 2 - exampleElementProperies.height / 2 - top;

		it("should create a rectangle", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			const space = screen.getByTestId("canvas-container");

			fireEvent.click(shapeTool);

			// Default shape is rectangle.
			// Prepare to create the rectangle.
			fireEvent.keyDown(document, { ctrlKey: true });

			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);

			const elements = screen.queryAllByTestId("element");
			const grids = screen.queryAllByTestId("resize-grid");
			const [element] = elements;
			const [grid] = grids;

			expect(elements).toHaveLength(1);
			expect(element).toBeInTheDocument();
			expect(element).toHaveAttribute("data-type", "rectangle");
			expect(element).toHaveAttribute("stroke", "#000000");
			expect(element).toHaveAttribute("fill", "hsla(0, 0%, 0%, 1)");
			// 18 is the minimum width and height for a rectangle.
			// Since we moved 100px to the right and 100px down, the width and height should be 118px.
			expect(grid).toHaveStyle({
				width: "118px",
				height: "118px"
			});
		});

		it("should create a circle", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			const space = screen.getByTestId("canvas-container");

			fireEvent.click(shapeTool);

			// This time, we want to create a circle.
			const option = screen.getByTestId("shape-circle");

			fireEvent.click(option);

			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);

			const elements = screen.queryAllByTestId("element");
			const grids = screen.queryAllByTestId("resize-grid");
			const [element] = elements;
			const [grid] = grids;

			expect(elements).toHaveLength(1);
			expect(element).toBeInTheDocument();
			expect(element).toHaveAttribute("data-type", "circle");
			expect(element).toHaveAttribute("stroke", "#000000");
			expect(element).toHaveAttribute("fill", "hsla(0, 0%, 0%, 1)");
			expect(grid).toHaveStyle({
				width: "118px",
				height: "118px"
			});
		});

		it("should create a triangle", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			const space = screen.getByTestId("canvas-container");

			fireEvent.click(shapeTool);

			// This time, we want to create a triangle.
			const option = screen.getByTestId("shape-triangle");

			fireEvent.click(option);

			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);

			const elements = screen.queryAllByTestId("element");
			const grids = screen.queryAllByTestId("resize-grid");
			const [element] = elements;
			const [grid] = grids;

			expect(elements).toHaveLength(1);
			expect(element).toBeInTheDocument();
			expect(element).toHaveAttribute("data-type", "triangle");
			expect(element).toHaveAttribute("stroke", "#000000");
			expect(element).toHaveAttribute("fill", "hsla(0, 0%, 0%, 1)");
			expect(grid).toHaveStyle({
				width: "118px",
				height: "118px"
			});
		});

		it.skip("should create a text element", () => {
			const textTool = screen.getByTestId("tool-text");
			const space = screen.getByTestId("canvas-container");
			let grids = screen.queryAllByTestId("resize-grid");

			vi.spyOn(space, "getBoundingClientRect").mockReturnValue(
				boundingClientRect
			);

			fireEvent.click(textTool);

			grids = screen.queryAllByTestId("resize-grid");

			expect(grids).toHaveLength(0);

			// We need to click in the space to create the text element.
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });

			grids = screen.queryAllByTestId("resize-grid");
			const [element] = screen.queryAllByTestId("element-textfield");
			expect(grids).toHaveLength(1);

			const [grid] = grids;
			const { left, top, width, height } = grid.style;
			const stripped = stripUnits([left, top, width, height], "px");

			expect(grid).toBeInTheDocument();
			expect(stripped).toEqual([
				300 - boundingClientRect.left,
				300 - boundingClientRect.top,
				100,
				30
			]);
			fireEvent.mouseUp(space);

			expect(grid).toHaveClass("focused");
			expect(document.activeElement).toBe(element);
			expect(element).toBeInstanceOf(HTMLTextAreaElement);
			expect(element).toHaveTextContent("Text");
		});

		it.skip("should type into the text element and save the new text", () => {
			const textTool = screen.getByTestId("tool-text");
			const space = screen.getByTestId("canvas-container");

			vi.spyOn(space, "getBoundingClientRect").mockReturnValue(
				boundingClientRect
			);

			fireEvent.click(textTool);

			// We need to click in the space to create the text element.
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			const [field] = screen.queryAllByTestId("element-textfield");

			fireEvent.mouseUp(space);

			expect(field).toBeInTheDocument();

			fireEvent.change(field, { target: { value: "Hello, World!" } });
			fireEvent.keyDown(field, {
				key: "Escape"
			});

			const [preview] = screen.queryAllByTestId("element-textpreview");

			expect(field).not.toBeInTheDocument();
			expect(preview).toHaveTextContent("Hello, World!");
		});

		it.skip("should revert to original text if saving empty text", () => {
			const textTool = screen.getByTestId("tool-text");
			const space = screen.getByTestId("canvas-container");

			vi.spyOn(space, "getBoundingClientRect").mockReturnValue(
				boundingClientRect
			);

			fireEvent.click(textTool);

			// We need to click in the space to create the text element.
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			const [field] = screen.queryAllByTestId("element-textfield");

			fireEvent.mouseUp(space);

			expect(field).toHaveTextContent("Text");

			fireEvent.change(field, { target: { value: "" } });
			fireEvent.keyDown(field, {
				key: "Escape"
			});

			const [preview] = screen.queryAllByTestId("element-textpreview");

			expect(field).not.toBeInTheDocument();
			expect(preview).toHaveTextContent("Text");
		});

		it("should focus an element on mouse down", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			const space = screen.getByTestId("canvas-container");

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			const elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(1);

			const resizeGrids = screen.queryAllByTestId("resize-grid");
			const resizeGrid = resizeGrids[0];
			const element = elements[0];

			expect(element).toHaveAttribute("data-focused", "false");

			fireEvent.focus(resizeGrid);

			expect(element).toHaveAttribute("data-focused", "true");
		});

		it("should lose focus after clicking off the element", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			const space = screen.getByTestId("canvas-container");

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			const elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(1);

			const resizeGrids = screen.queryAllByTestId("resize-grid");
			const resizeGrid = resizeGrids[0];
			const element = elements[0];
			expect(element).toHaveAttribute("data-focused", "false");

			fireEvent.focus(resizeGrid);
			expect(element).toHaveAttribute("data-focused", "true");

			fireEvent.mouseDown(document);

			expect(element).toHaveAttribute("data-focused", "false");
		});

		it("should switch focus between different elements", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			const space = screen.getByTestId("canvas-container");

			fireEvent.click(shapeTool);

			const circleOption = screen.getByTestId("shape-circle");

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			let elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(1);

			fireEvent.click(circleOption);

			// START: Create a circle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 400, clientY: 400 });
			fireEvent.mouseMove(document, { clientX: 500, clientY: 500, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a circle

			elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(2);

			const resizeGrids = screen.queryAllByTestId("resize-grid");
			const [rectResizeGrid, circleResizeGrid] = resizeGrids;
			const [rect, circle] = elements;

			expect(rect).toHaveAttribute("data-focused", "false");
			expect(circle).toHaveAttribute("data-focused", "false");

			fireEvent.focus(rectResizeGrid);

			expect(rect).toHaveAttribute("data-focused", "true");
			expect(circle).toHaveAttribute("data-focused", "false");

			fireEvent.mouseDown(document);
			fireEvent.focus(circleResizeGrid);

			expect(rect).toHaveAttribute("data-focused", "false");
			expect(circle).toHaveAttribute("data-focused", "true");
		});

		it("should select multiple elements with ctrl key", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			const space = screen.getByTestId("canvas-container");
			let elements = screen.queryAllByTestId("element");

			fireEvent.click(shapeTool);

			const shapes = ["rectangle", "circle", "triangle"];

			for (let i = 0; i < shapes.length; i++) {
				const option = screen.getByTestId(`shape-${shapes[i]}`);

				fireEvent.click(option);

				// START: Create a shape
				fireEvent.keyDown(document, { ctrlKey: true });
				fireEvent.mouseDown(space, {
					buttons: 1,
					clientX: 300 + 100 * i,
					clientY: 300 + 100 * i
				});
				fireEvent.mouseMove(document, {
					clientX: 400 + 100 * i,
					clientY: 400 + 100 * i,
					buttons: 1
				});
				fireEvent.mouseUp(document);
				// END: Create a shape

				elements = screen.queryAllByTestId("element");
				expect(elements).toHaveLength(i + 1);
			}
			const resizeGrids = screen.queryAllByTestId("resize-grid");
			const [rectGrid, circleGrid, triangleGrid] = resizeGrids;
			const [rect, circle, triangle] = elements;

			fireEvent.focus(rectGrid);

			expect(rect).toHaveAttribute("data-focused", "true");
			expect(circle).toHaveAttribute("data-focused", "false");
			expect(triangle).toHaveAttribute("data-focused", "false");

			fireEvent.mouseDown(document, { ctrlKey: true });
			fireEvent.focus(circleGrid);

			expect(rect).toHaveAttribute("data-focused", "true");
			expect(circle).toHaveAttribute("data-focused", "true");
			expect(triangle).toHaveAttribute("data-focused", "false");

			fireEvent.mouseDown(document, { ctrlKey: true });
			fireEvent.focus(triangleGrid);

			expect(
				elements.every(
					(element) => element.getAttribute("data-focused") === "true"
				)
			).toBe(true);

			fireEvent.mouseDown(document);

			expect(
				elements.every(
					(element) => element.getAttribute("data-focused") === "false"
				)
			).toBe(true);
		});

		it("should delete an element with the delete key", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			const space = screen.getByTestId("canvas-container");

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			let elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(1);

			const resizeGrids = screen.getAllByTestId("resize-grid");
			const resizeGrid = resizeGrids[0];
			const element = elements[0];

			fireEvent.focus(resizeGrid);

			expect(element).toHaveAttribute("data-focused", "true");

			fireEvent.keyDown(document, { key: "Delete" });

			elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(0);
		});

		it("should delete an element with the backspace key", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			const space = screen.getByTestId("canvas-container");

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			let elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(1);

			const resizeGrids = screen.getAllByTestId("resize-grid");
			const resizeGrid = resizeGrids[0];
			const element = elements[0];

			fireEvent.focus(resizeGrid);

			expect(element).toHaveAttribute("data-focused", "true");

			fireEvent.keyDown(document, { key: "Backspace" });

			elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(0);
		});

		it("should not delete an element with the delete key if no element is focused", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			const space = screen.getByTestId("canvas-container");

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			let elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(1);

			fireEvent.keyDown(document, { key: "Delete" });

			elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(1);
		});

		it("should delete multiple elements", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			const space = screen.getByTestId("canvas-container");
			let elements = screen.queryAllByTestId("element");

			fireEvent.click(shapeTool);

			const shapes = ["rectangle", "circle", "triangle"];

			for (let i = 0; i < shapes.length; i++) {
				const option = screen.getByTestId(`shape-${shapes[i]}`);

				fireEvent.click(option);

				// START: Create a shape
				fireEvent.keyDown(document, { ctrlKey: true });
				fireEvent.mouseDown(space, {
					buttons: 1,
					clientX: 300 + 100 * i,
					clientY: 300 + 100 * i
				});
				fireEvent.mouseMove(document, {
					clientX: 400 + 100 * i,
					clientY: 400 + 100 * i,
					buttons: 1
				});
				fireEvent.mouseUp(document);

				elements = screen.queryAllByTestId("element");
				expect(elements).toHaveLength(i + 1);
			}

			const resizeGrids = screen.getAllByTestId("resize-grid");

			for (let i = 0; i < elements.length; i++) {
				fireEvent.focus(resizeGrids[i]);
			}

			expect(
				elements.every(
					(element) => element.getAttribute("data-focused") === "true"
				)
			).toBe(true);

			fireEvent.keyDown(document, { key: "Delete" });

			elements = screen.queryAllByTestId("element");

			expect(elements).toHaveLength(0);
		});

		it("should copy and paste an element", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			const space = screen.getByTestId("canvas-container");

			vi.spyOn(space, "getBoundingClientRect").mockReturnValue(
				boundingClientRect
			);

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			let elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(1);

			let resizeGrids = screen.getAllByTestId("resize-grid");
			const resizeGrid = resizeGrids[0];
			const element = elements[0];

			fireEvent.focus(resizeGrid, { buttons: 1 });

			expect(element).toHaveAttribute("data-focused", "true");

			fireEvent.keyDown(document, { key: "c", ctrlKey: true });

			fireEvent.keyDown(document, { key: "v", ctrlKey: true });

			elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(2);

			resizeGrids = screen.getAllByTestId("resize-grid");
			const [grid1, grid2] = resizeGrids;

			const element1X = 300 - boundingClientRect.x;
			const element1Y = 300 - boundingClientRect.y;
			expect(grid1).toHaveStyle({
				left: `${element1X}px`,
				top: `${element1Y}px`,
				width: "118px",
				height: "118px"
			});
			expect(grid2).toHaveStyle({
				left: `${element1X + 10}px`,
				top: `${element1Y + 10}px`,
				width: "118px",
				height: "118px"
			});
		});

		it("should change the fill color of an element through hex field", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			const space = screen.getByTestId("canvas-container");
			let pickerButton = screen.queryByTestId("fill-picker-button");

			expect(pickerButton).not.toBeInTheDocument();

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			const elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(1);

			const resizeGrids = screen.getAllByTestId("resize-grid");
			const resizeGrid = resizeGrids[0];
			const element = elements[0];

			// The color picker should be visible only when an element is focused.
			fireEvent.focus(resizeGrid, { buttons: 1 });

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
			expect(element).toHaveAttribute("fill", "hsla(0, 0%, 0%, 1)");

			fireEvent.change(colorField as Node, { target: { value: color } });

			// Color field is automatically converted to uppercase.
			// So, we need to convert the color to uppercase to compare.
			expect(element).toHaveAttribute("fill", color.toUpperCase());
		});

		it("should change the border color of an element through hex field", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			const space = screen.getByTestId("canvas-container");
			let pickerButton = screen.queryByTestId("stroke-picker-button");

			expect(pickerButton).not.toBeInTheDocument();

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			const elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(1);

			const resizeGrids = screen.getAllByTestId("resize-grid");
			const resizeGrid = resizeGrids[0];
			const element = elements[0];

			// The color picker should be visible only when an element is focused.
			fireEvent.focus(resizeGrid, { buttons: 1 });

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
			expect(element).toHaveAttribute("stroke", "#000000");

			fireEvent.change(colorField as Node, { target: { value: color } });

			// Color field is automatically converted to uppercase.
			// So, we need to convert the color to uppercase to compare.
			expect(element).toHaveAttribute("stroke", color.toUpperCase());
		});

		it("should change fill color through color area", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			const space = screen.getByTestId("canvas-container");
			let pickerButton = screen.queryByTestId("fill-picker-button");

			expect(pickerButton).not.toBeInTheDocument();

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			const elements = screen.queryAllByTestId("element");
			expect(elements).toHaveLength(1);

			const resizeGrids = screen.getAllByTestId("resize-grid");
			const resizeGrid = resizeGrids[0];
			const element = elements[0];

			// The color picker should be visible only when an element is focused.
			fireEvent.focus(resizeGrid, { buttons: 1 });

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
			expect(element).toHaveAttribute("fill", "hsla(0, 0%, 0%, 1)");

			// The color area should change the fill color of the element.
			fireEvent.click(colorArea);

			expect(element).toHaveAttribute("fill", color.toUpperCase());
		});

		it("should change the fill color for multiple focused elements", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			const space = screen.getByTestId("canvas-container");
			let elements = screen.queryAllByTestId("element");
			let pickerButton = screen.queryByTestId("fill-picker-button");

			expect(pickerButton).not.toBeInTheDocument();
			fireEvent.click(shapeTool);

			const shapes = ["rectangle", "circle", "triangle"];

			for (let i = 0; i < shapes.length; i++) {
				const option = screen.getByTestId(`shape-${shapes[i]}`);

				fireEvent.click(option);

				// START: Create a shape
				fireEvent.keyDown(document, { ctrlKey: true });
				fireEvent.mouseDown(space, {
					buttons: 1,
					clientX: 300 + 100 * i,
					clientY: 300 + 100 * i
				});
				fireEvent.mouseMove(document, {
					clientX: 400 + 100 * i,
					clientY: 400 + 100 * i,
					buttons: 1
				});
				fireEvent.mouseUp(document);

				elements = screen.queryAllByTestId("element");
				expect(elements).toHaveLength(i + 1);
			}

			const resizeGrids = screen.queryAllByTestId("resize-grid");

			for (const resizeGrid of resizeGrids) {
				fireEvent.focus(resizeGrid, {
					buttons: 1
				});
			}

			expect(
				elements.every(
					(element) => element.getAttribute("data-focused") === "true"
				)
			).toBe(true);

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
					(element) => element.getAttribute("fill") === "hsla(0, 0%, 0%, 1)"
				)
			).toBe(true);

			fireEvent.click(colorArea);

			expect(
				elements.every(
					(element) => element.getAttribute("fill") === color.toUpperCase()
				)
			).toBe(true);
		});

		it("should update a layer preview after closing the popover", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			const space = screen.getByTestId("canvas-container");
			let pickerButton = screen.queryByTestId("fill-picker-button");
			const dispatchEventSpy = vi.spyOn(document, "dispatchEvent");

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			const elements = screen.queryAllByTestId("element");

			const resizeGrids = screen.getAllByTestId("resize-grid");
			const resizeGrid = resizeGrids[0];
			const element = elements[0];

			// The color picker should be visible only when an element is focused.
			fireEvent.focus(resizeGrid, { buttons: 1 });

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
			expect(element).toHaveAttribute("fill", "hsla(0, 0%, 0%, 1)");

			// The color area should change the fill color of the element.
			fireEvent.click(colorArea);

			expect(element).toHaveAttribute("fill", color.toUpperCase());

			// Click outside the popover to close it.
			fireEvent.click(pickerButton);

			const event = new CustomEvent("imageupdate", {
				detail: {
					layer: expect.any(HTMLCanvasElement)
				}
			});

			expect(dispatchEventSpy).toHaveBeenLastCalledWith(event);
		});

		it("should not update the preview if the color hasn't changed", () => {
			const shapeTool = screen.getByTestId("tool-shapes");
			const space = screen.getByTestId("canvas-container");
			let pickerButton = screen.queryByTestId("fill-picker-button");
			const dispatchEventSpy = vi.spyOn(document, "dispatchEvent");

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			const elements = screen.queryAllByTestId("element");

			const resizeGrids = screen.getAllByTestId("resize-grid");
			const resizeGrid = resizeGrids[0];
			const element = elements[0];

			// The color picker should be visible only when an element is focused.
			fireEvent.focus(resizeGrid, { buttons: 1 });

			pickerButton = screen.getByTestId("fill-picker-button");
			let popover = screen.queryByTestId("fill-picker-popover");

			expect(pickerButton).toBeInTheDocument();
			expect(popover).not.toBeInTheDocument();

			fireEvent.click(pickerButton);

			popover = screen.getByTestId("fill-picker-popover");
			expect(popover).toBeInTheDocument();

			// Default color is black.
			expect(element).toHaveAttribute("fill", "hsla(0, 0%, 0%, 1)");

			// Click outside the popover to close it.
			fireEvent.click(pickerButton);

			const event = new CustomEvent("imageupdate", {
				detail: {
					layer: expect.any(HTMLCanvasElement)
				}
			});

			expect(dispatchEventSpy).not.toHaveBeenLastCalledWith(event);
		});

		it("should resize the element north", () => {
			const space = screen.getByTestId("canvas-container");
			const shapeTool = screen.getByTestId("tool-shapes");

			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			const resizeGrids = screen.queryAllByTestId("resize-grid");
			const resizeGrid = resizeGrids[0];

			expect(resizeGrid).not.toHaveAttribute("data-resizing");

			// First, we need to click on the element to focus it.
			fireEvent.focus(resizeGrid, {
				buttons: 1
			});

			const resizeHandle = screen.getByTestId("handle-n");

			fireEvent.mouseDown(resizeHandle, {
				clientX: 100,
				clientY: 100,
				buttons: 1
			});

			expect(resizeGrid).toHaveAttribute("data-resizing", "n");

			// Move upward.
			// The element should increase in height and decrease in y.

			fireEvent.mouseMove(document, {
				clientX: 100,
				clientY: 50,
				buttons: 1
			});

			expect(resizeGrid).toHaveStyle({
				left: `${300 - boundingClientRect.x}px`,
				top: `${300 - boundingClientRect.y - 50}px`,
				width: "118px",
				height: "168px"
			});
			expect(boundingRectMock).toHaveBeenCalled();
		});

		it("should resize the element east", () => {
			const space = screen.getByTestId("canvas-container");
			const shapeTool = screen.getByTestId("tool-shapes");

			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			const resizeGrids = screen.queryAllByTestId("resize-grid");
			const resizeGrid = resizeGrids[0];

			expect(resizeGrid).not.toHaveAttribute("data-resizing");

			// First, we need to click on the element to focus it.
			fireEvent.focus(resizeGrid, {
				buttons: 1
			});

			const resizeHandle = screen.getByTestId("handle-e");

			fireEvent.mouseDown(resizeHandle, {
				clientX: 650,
				clientY: 100,
				buttons: 1
			});

			expect(resizeGrid).toHaveAttribute("data-resizing", "e");

			// Move rightward.
			// The element should increase in width.

			fireEvent.mouseMove(document, {
				clientX: 700,
				clientY: 100,
				buttons: 1
			});
			expect(resizeGrid).toHaveStyle({
				left: `${300 - boundingClientRect.x}px`,
				top: `${300 - boundingClientRect.y}px`,
				width: "168px",
				height: "118px"
			});
			expect(boundingRectMock).toHaveBeenCalled();
		});

		it("should resize the element south", () => {
			const space = screen.getByTestId("canvas-container");
			const shapeTool = screen.getByTestId("tool-shapes");

			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			const resizeGrids = screen.queryAllByTestId("resize-grid");
			const resizeGrid = resizeGrids[0];

			expect(resizeGrid).not.toHaveAttribute("data-resizing");

			// First, we need to click on the element to focus it.
			fireEvent.focus(resizeGrid, {
				buttons: 1
			});

			const resizeHandle = screen.getByTestId("handle-s");

			fireEvent.mouseDown(resizeHandle, {
				clientX: 100,
				clientY: 500,
				buttons: 1
			});

			expect(resizeGrid).toHaveAttribute("data-resizing", "s");

			// Move downward.
			// The element should increase in height.

			fireEvent.mouseMove(document, {
				clientX: 100,
				clientY: 550,
				buttons: 1
			});
			expect(resizeGrid).toHaveStyle({
				left: `${300 - boundingClientRect.x}px`,
				top: `${300 - boundingClientRect.y}px`,
				width: "118px",
				height: "168px"
			});
			expect(boundingRectMock).toHaveBeenCalled();
		});

		it("should resize the element west", () => {
			const space = screen.getByTestId("canvas-container");
			const shapeTool = screen.getByTestId("tool-shapes");

			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			const resizeGrids = screen.queryAllByTestId("resize-grid");
			const resizeGrid = resizeGrids[0];

			expect(resizeGrid).not.toHaveAttribute("data-resizing");

			// First, we need to click on the element to focus it.
			fireEvent.focus(resizeGrid, {
				buttons: 1
			});

			const resizeHandle = screen.getByTestId("handle-w");

			fireEvent.mouseDown(resizeHandle, {
				clientX: 100,
				clientY: 100,
				buttons: 1
			});

			expect(resizeGrid).toHaveAttribute("data-resizing", "w");

			// Move leftward.
			// The element should increase in width and decrease in x.

			fireEvent.mouseMove(document, {
				clientX: 50,
				clientY: 100,
				buttons: 1
			});
			expect(resizeGrid).toHaveStyle({
				left: `${300 - boundingClientRect.x - 50}px`,
				top: `${300 - boundingClientRect.y}px`,
				width: "168px",
				height: "118px"
			});
			expect(boundingRectMock).toHaveBeenCalled();
		});

		it("should resize the element north-east", () => {
			const space = screen.getByTestId("canvas-container");
			const shapeTool = screen.getByTestId("tool-shapes");

			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			const resizeGrids = screen.queryAllByTestId("resize-grid");
			const resizeGrid = resizeGrids[0];

			expect(resizeGrid).not.toHaveAttribute("data-resizing");

			// First, we need to click on the element to focus it.
			fireEvent.focus(resizeGrid, {
				buttons: 1
			});

			const resizeHandle = screen.getByTestId("handle-ne");

			fireEvent.mouseDown(resizeHandle, {
				clientX: 650,
				clientY: 100,
				buttons: 1
			});

			expect(resizeGrid).toHaveAttribute("data-resizing", "ne");

			// Move rightward and upward.
			// The element should increase in width and height and decrease in y.

			fireEvent.mouseMove(document, {
				clientX: 700,
				clientY: 50,
				buttons: 1
			});
			expect(resizeGrid).toHaveStyle({
				left: `${300 - boundingClientRect.x}px`,
				top: `${300 - boundingClientRect.y - 50}px`,
				width: "168px",
				height: "168px"
			});
			expect(boundingRectMock).toHaveBeenCalled();
		});

		it("should resize the element north-west", () => {
			const space = screen.getByTestId("canvas-container");
			const shapeTool = screen.getByTestId("tool-shapes");

			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			const resizeGrids = screen.queryAllByTestId("resize-grid");
			const resizeGrid = resizeGrids[0];

			expect(resizeGrid).not.toHaveAttribute("data-resizing");

			// First, we need to click on the element to focus it.
			fireEvent.focus(resizeGrid, {
				buttons: 1
			});

			const resizeHandle = screen.getByTestId("handle-nw");

			fireEvent.mouseDown(resizeHandle, {
				clientX: 100,
				clientY: 100,
				buttons: 1
			});

			expect(resizeGrid).toHaveAttribute("data-resizing", "nw");

			// Move leftward and upward.
			// The element should increase in width and height and decrease in x and y.

			fireEvent.mouseMove(document, {
				clientX: 50,
				clientY: 50,
				buttons: 1
			});
			expect(resizeGrid).toHaveStyle({
				left: `${300 - boundingClientRect.x - 50}px`,
				top: `${300 - boundingClientRect.y - 50}px`,
				width: "168px",
				height: "168px"
			});
			expect(boundingRectMock).toHaveBeenCalled();
		});

		it("should resize the element south-east", () => {
			const space = screen.getByTestId("canvas-container");
			const shapeTool = screen.getByTestId("tool-shapes");

			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			const resizeGrids = screen.queryAllByTestId("resize-grid");

			const resizeGrid = resizeGrids[0];

			expect(resizeGrid).not.toHaveAttribute("data-resizing");

			// First, we need to click on the element to focus it.
			fireEvent.focus(resizeGrid, {
				buttons: 1
			});

			const resizeHandle = screen.getByTestId("handle-se");

			fireEvent.mouseDown(resizeHandle, {
				clientX: 650,
				clientY: 500,
				buttons: 1
			});

			expect(resizeGrid).toHaveAttribute("data-resizing", "se");

			// Move rightward and downward.
			// The element should increase in width and height.

			fireEvent.mouseMove(document, {
				clientX: 700,
				clientY: 550,
				buttons: 1
			});
			expect(resizeGrid).toHaveStyle({
				left: `${300 - boundingClientRect.x}px`,
				top: `${300 - boundingClientRect.y}px`,
				width: "168px",
				height: "168px"
			});
			expect(boundingRectMock).toHaveBeenCalled();
		});

		it("should resize the element south-west", () => {
			const space = screen.getByTestId("canvas-container");
			const shapeTool = screen.getByTestId("tool-shapes");

			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			const resizeGrids = screen.queryAllByTestId("resize-grid");

			const resizeGrid = resizeGrids[0];

			expect(resizeGrid).not.toHaveAttribute("data-resizing");

			// First, we need to click on the element to focus it.
			fireEvent.focus(resizeGrid, {
				buttons: 1
			});

			const resizeHandle = screen.getByTestId("handle-sw");

			fireEvent.mouseDown(resizeHandle, {
				clientX: 100,
				clientY: 500,
				buttons: 1
			});

			expect(resizeGrid).toHaveAttribute("data-resizing", "sw");

			// Move leftward and downward.
			// The element should increase in width and height and decrease in x.

			fireEvent.mouseMove(document, {
				clientX: 50,
				clientY: 550,
				buttons: 1
			});
			expect(resizeGrid).toHaveStyle({
				left: `${300 - boundingClientRect.x - 50}px`,
				top: `${300 - boundingClientRect.y}px`,
				width: "168px",
				height: "168px"
			});
			expect(boundingRectMock).toHaveBeenCalled();
		});

		it("should move an element when moving the canvas", () => {
			const space = screen.getByTestId("canvas-container");
			const shapeTool = screen.getByTestId("tool-shapes");
			const moveTool = screen.getByTestId("tool-move");

			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			const resizeGrids = screen.queryAllByTestId("resize-grid");

			const resizeGrid = resizeGrids[0];

			fireEvent.click(moveTool);

			fireEvent.mouseDown(space, {
				clientX: 100,
				clientY: 100,
				buttons: 1
			});

			fireEvent.mouseMove(document, {
				clientX: 200,
				clientY: 200,
				buttons: 1
			});

			fireEvent.mouseUp(document);

			expect(resizeGrid).toHaveStyle({
				left: `${300 - boundingClientRect.x + 100}px`,
				top: `${300 - boundingClientRect.y + 100}px`
			});
			expect(boundingRectMock).toHaveBeenCalled();
		});

		it("should directly move an element", () => {
			const space = screen.getByTestId("canvas-container");
			const shapeTool = screen.getByTestId("tool-shapes");

			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			const resizeGrids = screen.queryAllByTestId("resize-grid");
			const resizeGrid = resizeGrids[0];

			fireEvent.focus(resizeGrid, { buttons: 1 });

			fireEvent.mouseMove(document, {
				clientX: 100,
				clientY: 100,
				buttons: 1
			});

			fireEvent.mouseMove(document, {
				clientX: 200,
				clientY: 200,
				buttons: 1
			});

			// From now on, the x and y values should be changed based
			// on dx and dy values.

			expect(resizeGrid).toHaveStyle({
				left: `${300 - boundingClientRect.x + 100}px`,
				top: `${300 - boundingClientRect.y + 100}px`
			});
		});

		it("should directly move multiple selected elements", () => {
			const space = screen.getByTestId("canvas-container");
			const shapeTool = screen.getByTestId("tool-shapes");
			let grids = screen.queryAllByTestId("resize-grid");

			vi.spyOn(space, "getBoundingClientRect").mockReturnValue(
				boundingClientRect
			);

			expect(grids).toHaveLength(0);

			fireEvent.click(shapeTool);

			const shapes = ["rectangle", "circle", "triangle"];

			for (let i = 0; i < shapes.length; i++) {
				const option = screen.getByTestId(`shape-${shapes[i]}`);

				fireEvent.click(option);

				// START: Create a rectangle
				fireEvent.keyDown(document, { ctrlKey: true });
				fireEvent.mouseDown(space, {
					buttons: 1,
					clientX: 300 + 100 * i,
					clientY: 300 + 100 * i
				});
				fireEvent.mouseMove(document, {
					clientX: 400 + 100 * i,
					clientY: 400 + 100 * i,
					buttons: 1
				});
				fireEvent.mouseUp(document);

				grids = screen.queryAllByTestId("resize-grid");
				expect(grids).toHaveLength(i + 1);

				fireEvent.focus(grids[i], { ctrlKey: true, buttons: 1 });
			}

			fireEvent.mouseMove(document, {
				clientX: 100,
				clientY: 100,
				buttons: 1
			});

			fireEvent.mouseMove(document, {
				clientX: 200,
				clientY: 200,
				buttons: 1
			});

			for (const grid of grids) {
				expect(grid).toHaveStyle({
					left: `${300 - boundingClientRect.x + 100}px`,
					top: `${300 - boundingClientRect.y + 100}px`
				});
			}
		});

		it("should move an element in the direction of the window resize", () => {
			const space = screen.getByTestId("canvas-container");
			const shapeTool = screen.getByTestId("tool-shapes");

			const boundingRectMock = vi
				.spyOn(space, "getBoundingClientRect")
				.mockReturnValue(boundingClientRect);

			fireEvent.click(shapeTool);

			// START: Create a rectangle
			fireEvent.keyDown(document, { ctrlKey: true });
			fireEvent.mouseDown(space, { buttons: 1, clientX: 300, clientY: 300 });
			fireEvent.mouseMove(document, { clientX: 400, clientY: 400, buttons: 1 });
			fireEvent.mouseUp(document);
			// END: Create a rectangle

			const resizeGrids = screen.queryAllByTestId("resize-grid");

			const resizeGrid = resizeGrids[0];

			fireEvent.focus(resizeGrid, { buttons: 1 });

			fireEvent.mouseMove(document, {
				clientX: 100,
				clientY: 100,
				buttons: 1
			});

			// Note: Default window size is 1024 x 768.
			fireEvent.resize(window, {
				target: { innerWidth: 800, innerHeight: 800 }
			});

			// The element should move in the direction of the window resize.
			// dx: -224
			// dy: 32
			expect(resizeGrid).toHaveStyle({
				left: `${300 - boundingClientRect.x - 224}px`,
				top: `${300 - boundingClientRect.y + 32}px`
			});
		});
	});
});
