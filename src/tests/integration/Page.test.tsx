import {
	describe,
	it,
	expect,
	vi,
	beforeEach,
	afterEach,
	afterAll
} from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/tests/test-utils";

import { Page } from "@/pages/index/index.page";
import { SliceStores } from "@/types";
import LayersStore from "@/state/stores/LayersStore";
import ElementsStore from "@/state/stores/ElementsStore";

describe("Page", () => {
	const mockState: Partial<SliceStores> = {
		layers: [
			{
				id: "123",
				name: "Layer 1",
				active: true,
				hidden: false
			}
		]
	};
	let originalCreateObjectURL: typeof URL.createObjectURL;
	let originalRevokeObjectURL: typeof URL.revokeObjectURL;

	beforeEach(() => {
		renderWithProviders(<Page />, { preloadedState: mockState });

		originalCreateObjectURL = URL.createObjectURL;
		originalRevokeObjectURL = URL.revokeObjectURL;
		URL.createObjectURL = vi.fn().mockReturnValue("blob://localhost:3000/1234");
		URL.revokeObjectURL = vi.fn();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	afterAll(() => {
		vi.restoreAllMocks();

		URL.createObjectURL = originalCreateObjectURL;
		URL.revokeObjectURL = originalRevokeObjectURL;
	});

	it("should render the page", () => {
		expect(screen.getByTestId("nav-bar")).toBeInTheDocument();
		expect(screen.getByTestId("main-content")).toBeInTheDocument();
	});

	it("should get the layers and elements from IndexedDB", () => {
		const layersStoreGetSpy = vi.spyOn(LayersStore, "getLayers");
		const elementsStoreGetSpy = vi.spyOn(ElementsStore, "getElements");

		expect(layersStoreGetSpy).toHaveBeenCalled();
		expect(elementsStoreGetSpy).toHaveBeenCalled();
	});

	it("should update the canvas with existing layers from IndexedDB", () => {
		vi.spyOn(LayersStore, "getLayers").mockResolvedValue([
			[
				"456",
				{
					id: "456",
					name: "A new layer",
					image: new Blob(),
					position: 0
				}
			]
		]);

		// Verify that the layer is being added to the canvas

		const layer = screen.getByTestId("canvas-layer");
		expect(layer).toBeInTheDocument();
		expect(layer).toHaveAttribute("id", "456");
		expect(layer).toHaveAttribute("data-name", "A new layer");
	});

	it("should set the layers in IndexedDB when saving", async () => {
		const layersStoreAddSpy = vi.spyOn(LayersStore, "addLayers");
		const elementsStoreAddSpy = vi.spyOn(ElementsStore, "addElements");
		// Setting elements in the preloaded state actually doesn't work, as
		// the elements are not being set in the IndexedDB. When
		// the elements are being set on first render, the elements are empty,
		// overridding the preloaded state. This is why we have to create
		// an element in the test itself.
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

		// Create an element
		const space = screen.getByTestId("canvas-container");
		const shapeTool = screen.getByTestId("tool-shapes");

		vi.spyOn(space, "getBoundingClientRect").mockReturnValue(
			boundingClientRect
		);

		fireEvent.click(shapeTool);

		// Create a rectangle
		fireEvent.keyDown(document, { ctrlKey: true });
		fireEvent.mouseDown(space, { buttons: 1, clientX: 100, clientY: 100 });
		fireEvent.mouseMove(document, { buttons: 1, clientX: 200, clientY: 200 });
		fireEvent.mouseUp(document);
		fireEvent.keyUp(document, { ctrlKey: false });

		fireEvent.keyDown(document, { key: "s", ctrlKey: true }); // Shortcut to save the layers
		const [layer] = mockState.layers!;

		await vi.waitFor(() => {
			expect(layersStoreAddSpy).toHaveBeenCalledWith([
				{
					id: layer.id,
					name: layer.name,
					image: expect.any(Blob),
					position: 0
				}
			]);

			expect(elementsStoreAddSpy).toHaveBeenCalledWith([
				[
					{
						id: expect.any(String),
						layerId: expect.any(String),
						type: "rectangle",
						x: 100,
						y: 100,
						width: 118,
						height: 118,
						fill: "hsla(0, 0%, 0%, 1)",
						stroke: "#000000"
					}
				]
			]);
		});
	});

	it("should open the reference window from the View menu", async () => {
		const viewTab = screen.getByRole("menuitem", { name: "View" });
		await userEvent.click(viewTab);

		const referenceWindowOption = screen.getByText("Reference Window");
		await userEvent.click(referenceWindowOption);

		const referenceWindow = screen.getByTestId("reference-window");
		expect(referenceWindow).toBeInTheDocument();
	});

	it("should close the reference window from the close button", async () => {
    const viewTab = screen.getByRole("menuitem", { name: "View" });
		await userEvent.click(viewTab);

		const referenceWindowOption = screen.getByText("Reference Window");
		await userEvent.click(referenceWindowOption);

		let referenceWindow = screen.queryByTestId("reference-window");
		expect(referenceWindow).toBeInTheDocument();

		expect(referenceWindowOption).not.toBeInTheDocument();

		// Close it.
		const closeRefWindow = screen.getByTestId("close-ref-window");
		await userEvent.click(closeRefWindow);
		
    referenceWindow = screen.queryByTestId("reference-window");
		expect(referenceWindow).not.toBeInTheDocument();
	});
});
