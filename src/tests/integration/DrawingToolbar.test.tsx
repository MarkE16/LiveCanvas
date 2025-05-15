import { expect, describe, it, vi, afterEach } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "../test-utils";
// Components
import DrawingToolbar from "../../components/DrawingToolbar/DrawingToolbar";
import { CanvasState } from "../../types";

vi.mock("../../renderer/usePageContext", () => ({
	usePageContext: () => ({ urlPathname: "/" }) // Mock the hook
}));

const preloadedState: CanvasState = {
	width: 500,
	height: 500,
	mode: "draw",
	drawStrength: 5,
	eraserStrength: 3,
	dpi: 1,
	color: "hsla(0, 0%, 0%, 1)",
	scale: 1,
	position: { x: 0, y: 0 },
	layers: [],
	shape: "rectangle",
	referenceWindowEnabled: false
};

describe("DrawingToolbar functionality", () => {
	afterEach(() => {
		vi.resetAllMocks();
	});

	it("should render the component", () => {
		renderWithProviders(<DrawingToolbar />);
		const toolbar = screen.queryByTestId("drawing-toolbar");

		expect(toolbar).toBeInTheDocument();
	});

	it("should be able to change draw strength", () => {
		// We need to change the mode to draw to be able to change the draw strength.

		renderWithProviders(<DrawingToolbar />, { preloadedState });
		const noActionsText = screen.queryByText(
			/Choose a different tool for actions./i
		);
		expect(noActionsText).not.toBeInTheDocument();

		const input = screen.getByTestId("strength-range");
		const value = screen.getByTestId("strength-value");

		expect(input).toBeInTheDocument();
		expect(value).toBeInTheDocument();

		// It should be 5 by default
		expect(Number(value.textContent)).toBe(5);

		// Change the value to 15
		fireEvent.change(input, { target: { value: "15" } });

		expect(value).toHaveTextContent("15");
	});

	it("should not go outside the min and max draw strength range", () => {
		renderWithProviders(<DrawingToolbar />, { preloadedState });

		const noActionsText = screen.queryByText(
			/Choose a different tool for actions./i
		);

		expect(noActionsText).not.toBeInTheDocument();

		const input = screen.getByTestId("strength-range");
		const value = screen.getByTestId("strength-value");

		// It should be 5 by default
		expect(value).toHaveTextContent("5");

		// Change the value to 0
		fireEvent.change(input, { target: { value: "0" } });

		expect(value).toHaveTextContent("1");

		// Change the value to 20
		fireEvent.change(input, { target: { value: "20" } });

		expect(value).toHaveTextContent("15");
	});

	it("should be able to change eraser strength", () => {
		// We need to change the mode to eraser to be able to change the eraser strength.
		const newMockState: CanvasState = { ...preloadedState, mode: "erase" };

		renderWithProviders(<DrawingToolbar />, {
			preloadedState: newMockState
		});

		const noActionsText = screen.queryByText(
			/Choose a different tool for actions./i
		);

		expect(noActionsText).not.toBeInTheDocument();

		const input = screen.getByTestId("strength-range");
		const value = screen.getByTestId("strength-value");

		expect(input).toBeInTheDocument();
		expect(value).toBeInTheDocument();

		// It should be 3 by default
		expect(value).toHaveTextContent("3");

		// Change it to 10
		fireEvent.change(input, { target: { value: "10" } });

		expect(value).toHaveTextContent("10");
	});

	it("should not go outside the min and max of the erase strength range", () => {
		// We need to change the mode to eraser to be able to change the eraser strength.
		const newMockState: CanvasState = { ...preloadedState, mode: "erase" };

		renderWithProviders(<DrawingToolbar />, {
			preloadedState: newMockState
		});

		const input = screen.getByTestId("strength-range");
		const value = screen.getByTestId("strength-value");

		// It should be 3 by default
		expect(value).toHaveTextContent("3");

		// Change the value to 0
		fireEvent.change(input, { target: { value: "0" } });

		expect(value).toHaveTextContent("3");

		// Change the value to 20
		fireEvent.change(input, { target: { value: "20" } });

		expect(value).toHaveTextContent("10");
	});
});
