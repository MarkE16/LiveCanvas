import {
	describe,
	expect,
	vi,
	it,
	beforeEach,
	beforeAll,
	afterAll
} from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import LayerPane from "../../components/LayerPane/LayerPane";
import { SliceStores } from "../../types";
import { renderWithProviders } from "../test-utils";
import * as useLayerReferences from "../../state/hooks/useLayerReferences";

// Essential so that when the component is rendered,
// the usePageContext hook doesn't throw an error (since it's not in the browser)
vi.mock("../../renderer/usePageContext", () => ({
	usePageContext: () => ({ urlPathname: "/" }) // Mock the hook
}));

const preloadedState: Partial<SliceStores> = {
	width: 400,
	height: 400,
	mode: "select",
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

describe("LayerPane functionality", () => {
	let originalConfirm: (message?: string) => boolean;
	vi.spyOn(useLayerReferences, "default").mockReturnValue({
		references: { current: [] },
		add: vi.fn(),
		remove: vi.fn(),
		// Mocked so that it doesn't throw an error. We don't have access to the
		// references since they're not rendered in the test.
		setActiveIndex: vi.fn(),
		getActiveLayer: vi.fn()
	});

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

		vi.restoreAllMocks();
	});

	it("should render the LayerPane component", () => {
		expect(screen.getByText("Layer 1")).toBeInTheDocument();
		expect(screen.getByText("Layer 2")).toBeInTheDocument();
	});

	it("should render the LayerPane component with active layer", () => {
		// Get the active layer by grabbing the label element

		const layer1 = screen.getByTestId("layer-" + preloadedState.layers![0].id);
		const layer2 = screen.getByTestId("layer-" + preloadedState.layers![1].id);

		expect(layer1).toHaveClass("active");
		expect(layer2).not.toHaveClass("active");
	});

	it("should switch active layer on click", () => {
		const layer1 = screen.getByTestId("layer-" + preloadedState.layers![0].id);
		const layer2 = screen.getByTestId("layer-" + preloadedState.layers![1].id);

		expect(layer1).toHaveClass("active");
		expect(layer2).not.toHaveClass("active");

		fireEvent.click(layer2);

		expect(layer1).not.toHaveClass("active");
		expect(layer2).toHaveClass("active");
	});

	it("should add a new layer when clicking the add layer button", () => {
		const button = screen.getByTestId("new-layer-button");
		const layerList = screen.getByTestId("layer-list");
		const layer1 = screen.queryByText("Layer 1");
		const layer2 = screen.queryByText("Layer 2");

		expect(layer1).toBeInTheDocument();
		expect(layer2).toBeInTheDocument();
		expect(layerList.children).toHaveLength(2);

		fireEvent.click(button);

		const newLayer = screen.queryByText("New Layer"); // new layers are named "New Layer" by default

		expect(newLayer).toBeInTheDocument();
		expect(layerList.children).toHaveLength(3);
	});

	it("should prevent adding a new layer when there are 65 layers", () => {
		let button = screen.getByTestId("new-layer-button");
		const layerList = screen.getByTestId("layer-list");

		expect(layerList.children).toHaveLength(2);

		// Add 63 layers
		for (let i = 0; i < 63; i++) {
			expect(button).not.toBeDisabled();
			fireEvent.click(button);
		}

		expect(layerList.children).toHaveLength(65);

		button = screen.getByTestId("new-layer-button");
		expect(button).toBeDisabled(); // The button should be disabled since we have 65 layers

		// Try to add another layer
		fireEvent.click(button);

		// The layer list should still have 65 layers
		expect(layerList.children).toHaveLength(65);
	});

	it("should delete a layer when available; should not delete if not available", () => {
		const layer1 = screen.queryByText("Layer 1");
		const layer2 = screen.queryByText("Layer 2");
		const layerList = screen.getByTestId("layer-list");

		expect(layerList.children).toHaveLength(2);
		expect(layer1).toBeInTheDocument();
		expect(layer2).toBeInTheDocument();

		const deleteButton = screen.getByTestId(
			"del-" + preloadedState.layers![0].id
		);

		expect(deleteButton).not.toBeNull();

		// Deleting the first layer.
		fireEvent.click(deleteButton);

		const layer1Deleted = screen.queryByText("Layer 1");
		expect(layer1Deleted).toBeNull();
		expect(layerList.children).toHaveLength(1);
		expect(layer2).toBeInTheDocument();

		const deleteButton2 = screen.queryByTestId(
			"del-" + preloadedState.layers![1].id
		);

		// Trying to delete the second layer. Since there is only one layer left, it should not be deleted, so the delete button should not be available.
		expect(deleteButton2).toBeNull();
	});

	it("should rename the layer", () => {
		const layer1Name = screen.getByTestId(
			"name-" + preloadedState.layers![0].id
		);
		const layer1RenameButton = screen.getByTestId(
			"rename-" + preloadedState.layers![0].id
		);
		const layer1Input = screen.queryByTestId(
			"name-input-" + preloadedState.layers![0].id
		);

		expect(layer1Name).not.toBeNull();
		expect(layer1Name).toHaveTextContent("Layer 1");
		expect(layer1RenameButton).not.toBeNull();
		expect(layer1Input).toBeNull();

		fireEvent.click(layer1RenameButton);

		const layer1InputAfterClick = screen.getByTestId(
			"name-input-" + preloadedState.layers![0].id
		);

		expect(layer1InputAfterClick).not.toBeNull();
		expect(layer1RenameButton).not.toBeDisabled(); // This button changes to a "confirm" button when renaming. Since we haven't changed the name yet, it should not be disabled.

		// Let's change the name!
		fireEvent.change(layer1InputAfterClick, {
			target: { value: "This is a new name" }
		});

		fireEvent.click(layer1RenameButton); // Click the check button to confirm the name change

		const layer1NameAfterChange = screen.getByText("This is a new name");

		expect(layer1NameAfterChange).not.toBeNull();
		expect(layer1NameAfterChange.textContent).toBe("This is a new name");
	});

	it("should not allow a rename if field is empty", () => {
		const layer1Name = screen.getByTestId(
			"name-" + preloadedState.layers![0].id
		);
		const layer1RenameButton = screen.getByTestId(
			"rename-" + preloadedState.layers![0].id
		);
		const layer1Input = screen.queryByTestId(
			"name-input-" + preloadedState.layers![0].id
		);

		expect(layer1Name).not.toBeNull();
		expect(layer1Name).toHaveTextContent("Layer 1");
		expect(layer1RenameButton).not.toBeNull();
		expect(layer1Input).toBeNull();

		fireEvent.click(layer1RenameButton);

		const layer1InputAfterClick = screen.getByTestId(
			"name-input-" + preloadedState.layers![0].id
		);

		expect(layer1RenameButton).not.toBeDisabled(); // This button changes to a "confirm" button when renaming. Since we haven't changed the name yet, it should not be disabled.
		expect(layer1InputAfterClick).not.toBeNull();

		// Let's change the name!
		fireEvent.change(layer1InputAfterClick, {
			target: { value: "" }
		});

		expect(layer1RenameButton).toBeDisabled(); // The button should be disabled since the input is empty.
	});

	it("should rename when pressing enter", () => {
		const layer1Name = screen.queryByText("Layer 1");
		const layer1RenameButton = screen.getByTestId(
			"rename-" + preloadedState.layers![0].id
		);
		const layer1Input = screen.queryByTestId(
			"name-input-" + preloadedState.layers![0].id
		);

		expect(layer1Name).toBeInTheDocument();
		expect(layer1RenameButton).not.toBeNull();
		expect(layer1Input).toBeNull();

		fireEvent.click(layer1RenameButton);

		const layer1InputAfterClick = screen.getByTestId(
			"name-input-" + preloadedState.layers![0].id
		);

		expect(layer1InputAfterClick).not.toBeNull();
		expect(layer1RenameButton).not.toBeDisabled();

		// Let's change the name!
		fireEvent.change(layer1InputAfterClick, {
			target: { value: "This is a new name" }
		});

		fireEvent.keyDown(layer1InputAfterClick, { key: "Enter" });

		const layer1NameAfterChange = screen.getByText(/This is a new name/i);

		expect(layer1NameAfterChange).not.toBeNull();
		expect(layer1NameAfterChange).toHaveTextContent("This is a new name");
	});

	it("should exit renaming when pressing escape while not modifiying the name", () => {
		const layer1Name = screen.getByTestId(
			"name-" + preloadedState.layers![0].id
		);
		const layer1RenameButton = screen.getByTestId(
			"rename-" + preloadedState.layers![0].id
		);
		const layer1Input = screen.queryByTestId(
			"name-input-" + preloadedState.layers![0].id
		);

		expect(layer1Name).not.toBeNull();
		expect(layer1Name).toHaveTextContent("Layer 1");
		expect(layer1RenameButton).not.toBeNull();
		expect(layer1Input).toBeNull();

		fireEvent.click(layer1RenameButton);

		const layer1InputAfterClick = screen.getByTestId(
			"name-input-" + preloadedState.layers![0].id
		);

		expect(layer1InputAfterClick).not.toBeNull();
		expect(layer1RenameButton).not.toBeDisabled();

		// Let's change the name, but then cancel it
		fireEvent.change(layer1InputAfterClick, {
			target: { value: "Name not saved" }
		});

		fireEvent.keyDown(layer1InputAfterClick, { key: "Escape" });

		const layer1NameAfterChange = screen.getByText(/Layer 1/i);

		expect(layer1NameAfterChange).not.toBeNull();
		expect(layer1NameAfterChange).toHaveTextContent("Layer 1");
	});

	it("should toggle layer visibility", async () => {
		const toggleButton = screen.getByTestId(
			"toggle-" + preloadedState.layers![0].id
		);

		expect(toggleButton).not.toBeNull();

		fireEvent.mouseOver(toggleButton);

		// Layer is visible by default
		const tooltip = await screen.findByText(/Hide/i);
		expect(tooltip).not.toBeNull();
		expect(tooltip).toHaveTextContent("Hide");

		fireEvent.click(toggleButton);
		expect(tooltip).toHaveTextContent("Show");

		fireEvent.click(toggleButton);
		expect(tooltip).toHaveTextContent("Hide");
	});

	it("should move a layer down", () => {
		const container = screen.getByTestId("layer-list");
		const layer1 = screen.getByTestId("layer-" + preloadedState.layers![0].id);
		const layer2 = screen.getByTestId("layer-" + preloadedState.layers![1].id);
		const downLayer1Button = screen.getByTestId(
			"down-" + preloadedState.layers![0].id
		);

		expect(downLayer1Button).not.toBeNull();
		expect(downLayer1Button).not.toBeDisabled();

		expect([...container.children]).toEqual([layer1, layer2]);

		fireEvent.click(downLayer1Button);

		expect([...container.children]).toEqual([layer2, layer1]);
	});

	it("should move a layer up", () => {
		const container = screen.getByTestId("layer-list");
		const layer1 = screen.getByTestId("layer-" + preloadedState.layers![0].id);
		const layer2 = screen.getByTestId("layer-" + preloadedState.layers![1].id);
		const upLayer2Button = screen.getByTestId(
			"up-" + preloadedState.layers![1].id
		);

		expect(upLayer2Button).not.toBeNull();
		expect(upLayer2Button).not.toBeDisabled();

		expect([...container.children]).toEqual([layer1, layer2]);

		fireEvent.click(upLayer2Button);

		expect([...container.children]).toEqual([layer2, layer1]);
	});

	it("should not move a layer up if it's already at the top", () => {
		const container = screen.getByTestId("layer-list");
		const layer1 = screen.getByTestId("layer-" + preloadedState.layers![0].id);
		const layer2 = screen.getByTestId("layer-" + preloadedState.layers![1].id);
		const upLayer1Button = screen.getByTestId(
			"up-" + preloadedState.layers![0].id
		);

		expect(upLayer1Button).not.toBeNull();

		expect([...container.children]).toEqual([layer1, layer2]);

		expect(upLayer1Button).toBeDisabled();
		fireEvent.click(upLayer1Button); // Disabled, since it's already at the top. So, it should do nothing.

		expect([...container.children]).toEqual([layer1, layer2]);
	});

	it("should not move a layer down if it's already at the bottom", () => {
		const container = screen.getByTestId("layer-list");
		const layer1 = screen.getByTestId("layer-" + preloadedState.layers![0].id);
		const layer2 = screen.getByTestId("layer-" + preloadedState.layers![1].id);
		const downLayer2Button = screen.getByTestId(
			"down-" + preloadedState.layers![1].id
		);

		expect(downLayer2Button).not.toBeNull();
		expect(downLayer2Button).toBeDisabled();

		expect([...container.children]).toEqual([layer1, layer2]);
	});

	it("should not move the layer at all if there is one layer", () => {
		const container = screen.getByTestId("layer-list");
		const layer1 = screen.getByTestId("layer-" + preloadedState.layers![0].id);
		const upLayer1Button = screen.getByTestId(
			"up-" + preloadedState.layers![0].id
		);
		const downLayer1Button = screen.getByTestId(
			"down-" + preloadedState.layers![0].id
		);

		expect(upLayer1Button).not.toBeNull();
		expect(downLayer1Button).not.toBeNull();

		// We have 2 layers by default, so let's remove one
		fireEvent.click(screen.getByTestId("del-" + preloadedState.layers![1].id));

		expect([...container.children]).toEqual([layer1]);

		// Now, we should not be able to move the layer up or down
		expect(upLayer1Button).toBeDisabled();
		expect(downLayer1Button).toBeDisabled();
	});
});
