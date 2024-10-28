import { describe, expect, vi, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import LayerPane from "../../components/LayerPane/LayerPane";
import { Mode } from "../../state/store"; // Import the Mode type
import { renderWithProviders } from "../test-utils";

// Essential so that when the component is rendered,
// the usePageContext hook doesn't throw an error (since it's not in the browser)
vi.mock("../../renderer/usePageContext", () => ({
	usePageContext: () => ({ urlPathname: "/" }) // Mock the hook
}));

const mockState = {
	width: 400,
	height: 400,
	mode: "select" as Mode,
	shape: "circle",
	scale: 1,
	show_all: false,
	position: { x: 0, y: 0 },
	layers: [
		{ name: "Layer 1", id: "1", active: true, hidden: false },
		{ name: "Layer 2", id: "2", active: false, hidden: false }
	],
	color: "hsla(0, 0%, 100%, 1)",
	drawStrength: 5,
	eraserStrength: 3
};
const preloadedState = { canvas: mockState };

describe("LayerPane functionality", () => {
	it("should render the LayerPane component", () => {
		renderWithProviders(<LayerPane />, { preloadedState: preloadedState });

		expect(screen.getByText("Layer 1")).not.toBeNull();
		expect(screen.getByText("Layer 2")).not.toBeNull();
	});

	it("should render the LayerPane component with active layer", () => {
		// Get the active layer by grabbing the label element

		renderWithProviders(<LayerPane />, { preloadedState: preloadedState });
		// const { canvas } = mockStore.getState();
		// const [l1, l2] = canvas.layers;

		const layer1 = screen.getAllByLabelText("Layer 1")[1];
		const layer2 = screen.getAllByLabelText("Layer 2")[1];

		expect(layer1.classList.contains("active")).toBe(true);
		expect(layer2.classList.contains("active")).toBe(false);

		// expect(l1.active).toBe(true);
		// expect(l2.active).toBe(false);
	});

	it("should switch active layer on click", () => {
		renderWithProviders(<LayerPane />, { preloadedState: preloadedState });

		const layer1 = screen.getAllByLabelText("Layer 1")[1];
		const layer2 = screen.getAllByLabelText("Layer 2")[1];

		expect(layer1.classList.contains("active")).toBe(true);
		expect(layer2.classList.contains("active")).toBe(false);

		fireEvent.click(layer2);

		expect(layer1.classList.contains("active")).toBe(false);
		expect(layer2.classList.contains("active")).toBe(true);
	});
});
