import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../test-utils";
import { describe, it, expect, beforeEach } from "vitest";
import SaveCanvasButton from "../../components/SaveCanvasButton/SaveCanvasButton";

describe("SaveCanvasButton functionality", () => {
	beforeEach(() => {
		renderWithProviders(<SaveCanvasButton />);
	});

	it("should render the SaveCanvasButton component", () => {
		const saveCanvasButton = screen.getByRole("button");
		expect(saveCanvasButton).not.toBeNull();
	});

	it("should properly show tooltip on hover", async () => {
		const saveCanvasButton = screen.getByRole("button");

		expect(saveCanvasButton).not.toBeNull();
		fireEvent.mouseOver(saveCanvasButton);

		// Wait for the tooltip to appear
		const tooltip = await screen.findByText(/save canvas/i);

		expect(tooltip).not.toBeNull();
		expect(tooltip.textContent).toBe("Save Canvas (CTRL + S)");
	});

	it("should indicate that the canvas was saved on the tooltip after click", async () => {
		const saveCanvasButton = screen.getByRole("button");

		expect(saveCanvasButton).not.toBeNull();
		fireEvent.mouseOver(saveCanvasButton);

		const tooltip = await screen.findByText(/save canvas/i);

		expect(tooltip).not.toBeNull();
		expect(tooltip.textContent).toBe("Save Canvas (CTRL + S)");

		fireEvent.click(saveCanvasButton);

		expect(tooltip.textContent).toBe("Saved!");
	});
});
