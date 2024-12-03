import {
	describe,
	expect,
	vi,
	it,
	beforeEach,
	beforeAll,
	afterAll
} from "vitest";
import {} from "@testing-library/user-event";
import { fireEvent, screen } from "@testing-library/react";
import LayerPane from "../../components/LayerPane/LayerPane";
import { CanvasState } from "../../types";
import { renderWithProviders } from "../test-utils";

// Essential so that when the component is rendered,
// the usePageContext hook doesn't throw an error (since it's not in the browser)
vi.mock("../../renderer/usePageContext", () => ({
	usePageContext: () => ({ urlPathname: "/" }) // Mock the hook
}));

const mockState: CanvasState = {
	width: 400,
	height: 400,
	mode: "select",
	shape: "circle",
	scale: 1,
	dpi: 1,
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
	let originalConfirm: (message?: string) => boolean;
	beforeAll(() => {
		originalConfirm = window.confirm;

		// Mock the window.confirm function so that it doesn't actually show a dialog. We do this because we can't interact with the dialog in a test.
		// (The dialog is used in the component to confirm deletion of a layer)
		window.confirm = () => true;
	});

	beforeEach(() => {
		renderWithProviders(<LayerPane />, { preloadedState });
	});

	afterAll(() => {
		// Restore the original window.confirm function
		window.confirm = originalConfirm;
	});

	it("should render the LayerPane component", () => {
		expect(screen.getByText("Layer 1")).not.toBeNull();
		expect(screen.getByText("Layer 2")).not.toBeNull();
	});

	it("should render the LayerPane component with active layer", () => {
		// Get the active layer by grabbing the label element

		const layer1 = screen.getByTestId("layer-" + mockState.layers[0].id);
		const layer2 = screen.getByTestId("layer-" + mockState.layers[1].id);

		expect(layer1.classList.contains("active")).toBe(true);
		expect(layer2.classList.contains("active")).toBe(false);
	});

	it("should switch active layer on click", () => {
		const layer1 = screen.getByTestId("layer-" + mockState.layers[0].id);
		const layer2 = screen.getByTestId("layer-" + mockState.layers[1].id);

		expect(layer1.classList.contains("active")).toBe(true);
		expect(layer2.classList.contains("active")).toBe(false);

		fireEvent.click(layer2);

		expect(layer1.classList.contains("active")).toBe(false);
		expect(layer2.classList.contains("active")).toBe(true);
	});

	it("should add a new layer when clicking the add layer button", () => {
		const button = screen.getByTestId("new-layer-button");
		const layerList = screen.getByTestId("layer-list");
		const layer1 = screen.getByTestId("layer-" + mockState.layers[0].id);
		const layer2 = screen.getByTestId("layer-" + mockState.layers[1].id);

		expect(layer1).not.toBeNull();
		expect(layer2).not.toBeNull();
		expect(layerList.children).toHaveLength(2);

		fireEvent.click(button);

		const newLayer = screen.getByText("New Layer"); // new layers are named "New Layer" by default

		expect(newLayer).not.toBeNull();
		expect(layerList.children).toHaveLength(3);
	});

	it("should delete a layer when available; should not delete if not available", () => {
		const layer1 = screen.getByText("Layer 1");
		const layer2 = screen.getByText("Layer 2");
		const layerList = screen.getByTestId("layer-list");

		expect(layerList.children).toHaveLength(2);
		expect(layer1).not.toBeNull();
		expect(layer2).not.toBeNull();

		const deleteButton = screen.getByTestId("del-" + mockState.layers[0].id);

		expect(deleteButton).not.toBeNull();

		// Deleting the first layer.
		fireEvent.click(deleteButton);

		const layer1Deleted = screen.queryByText("Layer 1");
		expect(layer1Deleted).toBeNull();
		expect(layerList.children).toHaveLength(1);
		expect(layer2).not.toBeNull();

		const deleteButton2 = screen.queryByTestId("del-" + mockState.layers[1].id);

		// Trying to delete the second layer. Since there is only one layer left, it should not be deleted, so the delete button should not be available.
		expect(deleteButton2).toBeNull();
	});

	it("should rename the layer", () => {
		const layer1Name = screen.getByTestId("name-" + mockState.layers[0].id);
		const layer1RenameButton = screen.getByTestId(
			"rename-" + mockState.layers[0].id
		);
		const layer1Input = screen.queryByTestId(
			"name-input-" + mockState.layers[0].id
		);

		expect(layer1Name).not.toBeNull();
		expect(layer1Name.textContent).toBe("Layer 1");
		expect(layer1RenameButton).not.toBeNull();
		expect(layer1Input).toBeNull();

		fireEvent.click(layer1RenameButton);

		const layer1InputAfterClick = screen.getByTestId(
			"name-input-" + mockState.layers[0].id
		);

		expect(layer1InputAfterClick).not.toBeNull();

		// Let's change the name!
		fireEvent.change(layer1InputAfterClick, {
			target: { value: "This is a new name" }
		});

		fireEvent.click(layer1RenameButton); // Click the check button to confirm the name change

		const layer1NameAfterChange = screen.getByText("This is a new name");

		expect(layer1NameAfterChange).not.toBeNull();
		expect(layer1NameAfterChange.textContent).toBe("This is a new name");
	});

	it("should not allow a rename if field is empty", async () => {
		const layer1Name = screen.getByTestId("name-" + mockState.layers[0].id);
		const layer1RenameButton = screen.getByTestId(
			"rename-" + mockState.layers[0].id
		);
		const layer1Input = screen.queryByTestId(
			"name-input-" + mockState.layers[0].id
		);

		expect(layer1Name).not.toBeNull();
		expect(layer1Name.textContent).toBe("Layer 1");
		expect(layer1RenameButton).not.toBeNull();
		expect(layer1Input).toBeNull();

		fireEvent.click(layer1RenameButton);

		const layer1InputAfterClick = screen.getByTestId(
			"name-input-" + mockState.layers[0].id
		);

		expect(layer1InputAfterClick).not.toBeNull();

		// Let's change the name!
		fireEvent.change(layer1InputAfterClick, {
			target: { value: "" }
		});

		fireEvent.mouseOver(layer1RenameButton); // Hover over the button to show the tooltip since it's disabled

		const tooltip = await screen.findByText(/Layer name cannot be empty/i);

		expect(tooltip).not.toBeNull();
		expect(tooltip.textContent).toBe("Layer name cannot be empty.");
	});

	it("should toggle layer visibility", async () => {
		const toggleButton = screen.getByTestId("toggle-" + mockState.layers[0].id);

		expect(toggleButton).not.toBeNull();

		fireEvent.mouseOver(toggleButton);

		// Layer is visible by default
		const tooltip = await screen.findByText(/Hide/i);
		expect(tooltip).not.toBeNull();
		expect(tooltip.textContent).toBe("Hide");

		fireEvent.click(toggleButton);
		expect(tooltip.textContent).toBe("Show");

		fireEvent.click(toggleButton);
		expect(tooltip.textContent).toBe("Hide");
	});

	it("should move a layer down", () => {
		const container = screen.getByTestId("layer-list");
		const layer1 = screen.getByTestId("layer-" + mockState.layers[0].id);
		const layer2 = screen.getByTestId("layer-" + mockState.layers[1].id);
		const downLayer1Button = screen.getByTestId(
			"down-" + mockState.layers[0].id
		);

		expect(downLayer1Button).not.toBeNull();

		expect([...container.children]).toEqual([layer1, layer2]);

		fireEvent.click(downLayer1Button);

		expect([...container.children]).toEqual([layer2, layer1]);
	});

	it("should move a layer up", () => {
		const container = screen.getByTestId("layer-list");
		const layer1 = screen.getByTestId("layer-" + mockState.layers[0].id);
		const layer2 = screen.getByTestId("layer-" + mockState.layers[1].id);
		const upLayer2Button = screen.getByTestId("up-" + mockState.layers[1].id);

		expect(upLayer2Button).not.toBeNull();

		expect([...container.children]).toEqual([layer1, layer2]);

		fireEvent.click(upLayer2Button);

		expect([...container.children]).toEqual([layer2, layer1]);
	});

	it("should not move a layer up if it's already at the top", () => {
		const container = screen.getByTestId("layer-list");
		const layer1 = screen.getByTestId("layer-" + mockState.layers[0].id);
		const layer2 = screen.getByTestId("layer-" + mockState.layers[1].id);
		const upLayer1Button = screen.getByTestId("up-" + mockState.layers[0].id);

		expect(upLayer1Button).not.toBeNull();

		expect([...container.children]).toEqual([layer1, layer2]);

		fireEvent.click(upLayer1Button); // Disabled, since it's already at the top. So, it should do nothing.

		expect([...container.children]).toEqual([layer1, layer2]);
	});

	it("should not move a layer down if it's already at the bottom", () => {
		const container = screen.getByTestId("layer-list");
		const layer1 = screen.getByTestId("layer-" + mockState.layers[0].id);
		const layer2 = screen.getByTestId("layer-" + mockState.layers[1].id);
		const downLayer2Button = screen.getByTestId(
			"down-" + mockState.layers[1].id
		);

		expect(downLayer2Button).not.toBeNull();

		expect([...container.children]).toEqual([layer1, layer2]);

		fireEvent.click(downLayer2Button); // Disabled, since it's already at the bottom. So, it should do nothing.

		expect([...container.children]).toEqual([layer1, layer2]);
	});

	it("should not move the layer at all if there is one layer", () => {
		const container = screen.getByTestId("layer-list");
		const layer1 = screen.getByTestId("layer-" + mockState.layers[0].id);
		const upLayer1Button = screen.getByTestId("up-" + mockState.layers[0].id);
		const downLayer1Button = screen.getByTestId(
			"down-" + mockState.layers[0].id
		);

		expect(upLayer1Button).not.toBeNull();
		expect(downLayer1Button).not.toBeNull();

		// We have 2 layers by default, so let's remove one
		fireEvent.click(screen.getByTestId("del-" + mockState.layers[1].id));

		expect([...container.children]).toEqual([layer1]);

		// Now, we should not be able to move the layer up or down
		fireEvent.click(upLayer1Button);

		expect([...container.children]).toEqual([layer1]);

		fireEvent.click(downLayer1Button);

		expect([...container.children]).toEqual([layer1]);
	});
});
