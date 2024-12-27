import {
	expect,
	beforeEach,
	beforeAll,
	afterAll,
	describe,
	it,
	vi
} from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../test-utils";
import type { Color } from "react-aria-components";
import { parseColor } from "react-aria-components";

import Main from "../../components/Main/Main";
import { PropsWithChildren } from "react";

type MockProps = PropsWithChildren & {
	onChange?: (color: Color) => void;
};

const MOCK_COLOR = parseColor("#ff0000");

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

	beforeEach(() => {
		renderWithProviders(<Main />);
	});

	beforeAll(() => {
		createObjectURLOriginal = URL.createObjectURL;
		revokeObjectURLOriginal = URL.revokeObjectURL;

		URL.createObjectURL = vi.fn(() => "blob:http://localhost:3000/1234");
		URL.revokeObjectURL = vi.fn();
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
			const styles = selectRect.style;
			const left = styles.left;
			const top = styles.top;
			const width = styles.width;
			const height = styles.height;

			const asArray = [left, top, width, height];
			const errors = asArray.findIndex((v) => v === undefined);

			expect(errors).toBe(-1);

			const [x, y, w, h] = asArray.map((v) =>
				parseInt(v!.toString().replace("px", ""))
			);

			expect(x).toBe(beforeX);
			expect(y).toBe(beforeY);
			expect(w).toBe(afterX - beforeX);
			expect(h).toBe(afterY - beforeY);

			// Now, we release the mouse button.
			// The rect should disappear.

			fireEvent.mouseUp(document);
			expect(selectRect).not.toBeVisible();
		});

		it("should be able to draw the selection rect when dragging north east", () => {
			const space = screen.getByTestId("canvas-container");
			const selectRect = screen.getByTestId("selection-rect");

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

			// Now, let's move the mouse to create the selection rect.
			fireEvent.mouseMove(document, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1
			});

			// The rect should be visible now.
			expect(selectRect).toBeVisible();

			// now, calculate the rect dimensions and position.
			const styles = selectRect.style;
			const left = styles.left;
			const top = styles.top;
			const width = styles.width;
			const height = styles.height;

			const asArray = [left, top, width, height];
			const errors = asArray.findIndex((v) => v === undefined);

			expect(errors).toBe(-1);

			const [x, y, w, h] = asArray.map((v) =>
				parseInt(v!.toString().replace("px", ""))
			);

			expect(x).toBe(beforeX);
			expect(y).toBe(afterY);
			expect(w).toBe(afterX - beforeX);
			expect(h).toBe(beforeY - afterY);

			// Now, we release the mouse button.
			fireEvent.mouseUp(document);
			expect(selectRect).not.toBeVisible();
		});

		it("should be able to draw the selection rect when dragging north west", () => {
			const space = screen.getByTestId("canvas-container");
			const selectRect = screen.getByTestId("selection-rect");

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

			// Now, let's move the mouse to create the selection rect.
			fireEvent.mouseMove(document, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1
			});

			// The rect should be visible now.
			expect(selectRect).toBeVisible();

			// now, calculate the rect dimensions and position.
			const styles = selectRect.style;
			const left = styles.left;
			const top = styles.top;
			const width = styles.width;
			const height = styles.height;

			const asArray = [left, top, width, height];
			const errors = asArray.findIndex((v) => v === undefined);

			expect(errors).toBe(-1);

			const [x, y, w, h] = asArray.map((v) =>
				parseInt(v!.toString().replace("px", ""))
			);

			expect(x).toBe(afterX);
			expect(y).toBe(afterY);
			expect(w).toBe(beforeX - afterX);
			expect(h).toBe(beforeY - afterY);

			// Now, we release the mouse button.
			fireEvent.mouseUp(document);
			expect(selectRect).not.toBeVisible();
		});

		it("should be able to draw the selection rect when dragging south west", () => {
			const space = screen.getByTestId("canvas-container");
			const selectRect = screen.getByTestId("selection-rect");

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

			expect(selectRect).not.toBeVisible();

			// Now, let's move the mouse to create the selection rect.
			fireEvent.mouseMove(document, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1
			});

			// The rect should be visible now.
			expect(selectRect).toBeVisible();

			// now, calculate the rect dimensions and position.
			const styles = selectRect.style;
			const left = styles.left;
			const top = styles.top;
			const width = styles.width;
			const height = styles.height;

			const asArray = [left, top, width, height];
			const errors = asArray.findIndex((v) => v === undefined);

			expect(errors).toBe(-1);

			const [x, y, w, h] = asArray.map((v) =>
				parseInt(v!.toString().replace("px", ""))
			);

			expect(x).toBe(afterX);
			expect(y).toBe(beforeY);
			expect(w).toBe(beforeX - afterX);
			expect(h).toBe(afterY - beforeY);

			// Now, we release the mouse button.
			fireEvent.mouseUp(document);
			expect(selectRect).not.toBeVisible();
		});

		it("should not draw the selection rect if the mouse is not over the canvas", () => {
			// Note: The toolbar is not inside of the canvas space; therefore,
			// we can use the toolbar to simulate the mouse not being over the canvas.
			const toolbar = screen.getByTestId("left-toolbar-container");
			const selectRect = screen.getByTestId("selection-rect");

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

			expect(selectRect).not.toBeVisible();

			// Now, let's move the mouse to create the selection rect.
			fireEvent.mouseMove(document, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1
			});

			// The rect should not be visible.
			expect(selectRect).not.toBeVisible();

			// Now, we release the mouse button.
			fireEvent.mouseUp(document);
			expect(selectRect).not.toBeVisible();
		});
	});

	describe("Element functionality", () => {
		const exampleElementProperies = {
			x: NaN,
			y: NaN,
			width: 100,
			height: 100,
			fill: "#000000",
			border: "#000000"
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
			expect(elements[0]).toHaveAttribute("data-shape", "rectangle");
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
			expect(elements[0]).toHaveAttribute("data-shape", "circle");
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
			expect(elements[0]).toHaveAttribute("data-shape", "triangle");
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
			let pickerButton = screen.queryByTestId("border-picker-button");

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
			pickerButton = screen.getByTestId("border-picker-button");
			let popover = screen.queryByTestId("border-picker-popover");

			expect(pickerButton).toBeInTheDocument();
			expect(popover).not.toBeInTheDocument();

			fireEvent.click(pickerButton);

			popover = screen.getByTestId("border-picker-popover");
			expect(popover).toBeInTheDocument();

			const colorFieldDiv = screen.getByTestId("picker-field");

			const colorField = colorFieldDiv.lastChild;

			// Default color is black.
			expect(element).toHaveAttribute("data-border", "#000000");

			fireEvent.change(colorField as Node, { target: { value: color } });

			// Color field is automatically converted to uppercase.
			// So, we need to convert the color to uppercase to compare.
			expect(element).toHaveAttribute("data-border", color.toUpperCase());
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
			).toBeTruthy();

			fireEvent.click(colorArea);

			expect(
				elements.every(
					(element) => element.getAttribute("data-fill") === color.toUpperCase()
				)
			).toBeTruthy();
		});
	});
});
