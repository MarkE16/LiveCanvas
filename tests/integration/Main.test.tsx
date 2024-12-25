import { expect, beforeEach, describe, it } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../test-utils";

import Main from "../../components/Main/Main";

describe("Canvas Interactive Functionality", () => {
	beforeEach(() => {
		renderWithProviders(<Main />);
	});

	it("should render the Main component", () => {
		expect(screen.getByRole("main")).toBeInTheDocument();
	});

	describe("Selection Functionality", () => {
		it("should be able to draw the selection rect when dragging south east", () => {
			const pane = screen.getByTestId("canvas-pane");
			const selectRect = screen.getByTestId("selection-rect");

			// When not dragging, the selection rect should not be visible.
			expect(selectRect).not.toBeVisible();

			// Now, we start dragging.
			const beforeX = 100;
			const beforeY = 100;
			const afterX = 200;
			const afterY = 200;

			// First, we need to click on the canvas to start the drag.
			// Note: the rect should still not be visible.
			fireEvent.mouseDown(document, {
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
				buttons: 1,
				target: pane
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
			const pane = screen.getByTestId("canvas-pane");
			const selectRect = screen.getByTestId("selection-rect");

			// When not dragging, the selection rect should not be visible.
			expect(selectRect).not.toBeVisible();

			// Now, we start dragging.

			const beforeX = 100;
			const beforeY = 100;
			const afterX = 200;
			const afterY = 50;

			// First, we need to click on the canvas to start the drag.
			// Note: the rect should still not be visible.
			fireEvent.mouseDown(document, {
				clientX: beforeX,
				clientY: beforeY,
				buttons: 1
			});

			expect(selectRect).not.toBeVisible();

			// Now, let's move the mouse to create the selection rect.
			fireEvent.mouseMove(document, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1,
				target: pane
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
			const pane = screen.getByTestId("canvas-pane");
			const selectRect = screen.getByTestId("selection-rect");

			// When not dragging, the selection rect should not be visible.
			expect(selectRect).not.toBeVisible();

			// Now, we start dragging.
			const beforeX = 100;
			const beforeY = 100;
			const afterX = 50;
			const afterY = 50;

			// First, we need to click on the canvas to start the drag.
			fireEvent.mouseDown(document, {
				clientX: beforeX,
				clientY: beforeY,
				buttons: 1
			});
			expect(selectRect).not.toBeVisible();

			// Now, let's move the mouse to create the selection rect.
			fireEvent.mouseMove(document, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1,
				target: pane
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
			const pane = screen.getByTestId("canvas-pane");
			const selectRect = screen.getByTestId("selection-rect");

			// When not dragging, the selection rect should not be visible.
			expect(selectRect).not.toBeVisible();

			// Now, we start dragging.
			const beforeX = 100;
			const beforeY = 100;
			const afterX = 50;
			const afterY = 200;

			// First, we need to click on the canvas to start the drag.
			fireEvent.mouseDown(document, {
				clientX: beforeX,
				clientY: beforeY,
				buttons: 1
			});

			expect(selectRect).not.toBeVisible();

			// Now, let's move the mouse to create the selection rect.
			fireEvent.mouseMove(document, {
				clientX: afterX,
				clientY: afterY,
				buttons: 1,
				target: pane
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
	});
});
