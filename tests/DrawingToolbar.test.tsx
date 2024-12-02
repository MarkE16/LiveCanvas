import { expect, describe, it, vi, afterEach } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import * as ReduxHooks from "../state/hooks/reduxHooks";
import * as UTILS from "../utils";
import { SHAPES } from "../state/store";

// Redux Actions
import { changeShape } from "../state/slices/canvasSlice";

// Components
import DrawingToolbar from "../components/DrawingToolbar/DrawingToolbar";
import { CanvasState } from "../types";

vi.mock("../../renderer/usePageContext", () => ({
	usePageContext: () => ({ urlPathname: "/" }) // Mock the hook
}));

const mockState: CanvasState = {
	width: 500,
	height: 500,
	mode: "draw",
	drawStrength: 5,
	eraserStrength: 3,
	shape: "circle",
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

	it("should render with default shape", async () => {
		const newMockState: CanvasState = { ...mockState, mode: "shapes" };
		const newPreloadedState = { canvas: newMockState };
		renderWithProviders(<DrawingToolbar />, {
			preloadedState: newPreloadedState
		});
		const noActionsText = screen.queryByText(
			/Choose a different tool for actions./i
		);
		const shape = screen.getByTestId(`shape-${mockState.shape}`);
		const tooltipText = UTILS.capitalize(mockState.shape);

		expect(noActionsText).toBeNull();
		expect(shape).not.toBeNull();

		fireEvent.mouseOver(shape);

		const tooltip = await screen.findByText(new RegExp(tooltipText, "i"));

		expect(tooltip).not.toBeNull();
		expect(tooltip.textContent).toBe(tooltipText);

		expect(shape.classList.contains("active")).toBe(true);
	});

	it("should change to other shapes", () => {
		const newMockState: CanvasState = { ...mockState, mode: "shapes" };
		const newPreloadedState = { canvas: newMockState };

		const mockDispatch = vi.fn();
		vi.spyOn(ReduxHooks, "useAppDispatch").mockReturnValue(mockDispatch);

		renderWithProviders(<DrawingToolbar />, {
			preloadedState: newPreloadedState
		});

		for (let i = 1; i < SHAPES.length; i++) {
			const shape = screen.getByTestId(`shape-${SHAPES[i].name}`);

			expect(shape).not.toBeNull();

			expect(mockDispatch).toHaveBeenCalledTimes(i - 1);

			fireEvent.click(shape);

			expect(mockDispatch).toHaveBeenCalledTimes(i);
			expect(mockDispatch).toHaveBeenCalledWith(changeShape(SHAPES[i].name));
		}

		expect(mockDispatch).toHaveBeenCalledTimes(SHAPES.length - 1);
	});
});
