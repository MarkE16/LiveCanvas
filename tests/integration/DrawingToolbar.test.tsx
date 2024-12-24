import { expect, describe, it, vi, afterEach } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "../test-utils";

// Components
import DrawingToolbar from "../../components/DrawingToolbar/DrawingToolbar";
import { CanvasState } from "../../types";

vi.mock("../../renderer/usePageContext", () => ({
	usePageContext: () => ({ urlPathname: "/" }) // Mock the hook
}));

const mockState: CanvasState = {
	width: 500,
	height: 500,
	mode: "draw",
	drawStrength: 5,
	eraserStrength: 3,
	dpi: 1,
	color: "hsla(0, 0%, 0%, 1)",
	scale: 1,
	position: { x: 0, y: 0 },
	layers: []
};
const preloadedState = { canvas: mockState };

describe("DrawingToolbar functionality", () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	it("should render the component", () => {
		renderWithProviders(<DrawingToolbar />);
		const text = screen.getByText(/Choose a different tool for actions./i); // The mode is select by default; so this text should be present since there is no additional settings for the select mode

		expect(text).not.toBeNull();
	});

	it("should be able to change draw strength", () => {
		// We need to change the mode to draw to be able to change the draw strength.

		renderWithProviders(<DrawingToolbar />, { preloadedState });
		const noActionsText = screen.queryByText(
			/Choose a different tool for actions./i
		);
		const input = screen.getByTestId("strength-range");
		const value = screen.getByTestId("strength-value");

		expect(noActionsText).toBeNull();
		expect(input).not.toBeNull();
		expect(value).not.toBeNull();

		// It should be 5 by default
		expect(Number(value.textContent)).toBe(5);

		// Change the value to 15
		fireEvent.change(input, { target: { value: "15" } });

		expect(Number(value.textContent)).toBe(15);
	});

	it("should not go outside the min and max draw strength range", () => {
		renderWithProviders(<DrawingToolbar />, { preloadedState });
		const input = screen.getByTestId("strength-range");
		const value = screen.getByTestId("strength-value");

		// It should be 5 by default
		expect(Number(value.textContent)).toBe(5);

		// Change the value to 0
		fireEvent.change(input, { target: { value: "0" } });

		expect(Number(value.textContent)).toBe(1);

		// Change the value to 20
		fireEvent.change(input, { target: { value: "20" } });

		expect(Number(value.textContent)).toBe(15);
	});

	it("should be able to change eraser strength", () => {
		// We need to change the mode to eraser to be able to change the eraser strength.
		const newMockState: CanvasState = { ...mockState, mode: "erase" };
		const newPreloadedState = { canvas: newMockState };

		renderWithProviders(<DrawingToolbar />, {
			preloadedState: newPreloadedState
		});

		const noActionsText = screen.queryByText(
			/Choose a different tool for actions./i
		);
		const input = screen.getByTestId("strength-range");
		const value = screen.getByTestId("strength-value");

		expect(noActionsText).toBeNull();
		expect(input).not.toBeNull();
		expect(value).not.toBeNull();

		// It should be 3 by default
		expect(Number(value.textContent)).toBe(3);

		// Change it to 10
		fireEvent.change(input, { target: { value: "10" } });

		expect(Number(value.textContent)).toBe(10);
	});

	it("should not go outside the min and max of the erase strength range", () => {
		// We need to change the mode to eraser to be able to change the eraser strength.
		const newMockState: CanvasState = { ...mockState, mode: "erase" };
		const newPreloadedState = { canvas: newMockState };

		renderWithProviders(<DrawingToolbar />, {
			preloadedState: newPreloadedState
		});

		const input = screen.getByTestId("strength-range");
		const value = screen.getByTestId("strength-value");

		// It should be 3 by default
		expect(Number(value.textContent)).toBe(3);

		// Change the value to 0
		fireEvent.change(input, { target: { value: "2" } });

		expect(Number(value.textContent)).toBe(3);

		// Change the value to 20
		fireEvent.change(input, { target: { value: "20" } });

		expect(Number(value.textContent)).toBe(10);
	});
});
