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
import { renderWithProviders } from "../test-utils";

import { Page } from "../../pages/index/index.page";
import { SliceStores } from "../../types";
import * as useIndexed from "../../state/hooks/useIndexed";

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
	const indexedGetMock = vi.fn();
	const indexedSetMock = vi.fn();
	const indexedDeleteMock = vi.fn();
	let originalCreateObjectURL: typeof URL.createObjectURL;
	let originalRevokeObjectURL: typeof URL.revokeObjectURL;

	beforeEach(() => {
		renderWithProviders(<Page />, { preloadedState: mockState });
		vi.spyOn(useIndexed, "default").mockReturnValue({
			get: indexedGetMock,
			set: indexedSetMock,
			remove: indexedDeleteMock
		});

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
		const [call1, call2] = indexedGetMock.mock.calls;

		expect(call1).toEqual(["layers"]);
		expect(call2).toEqual(["elements", "items"]);
	});

	it("should update the canvas with existing layers from IndexedDB", () => {
		indexedGetMock.mockReturnValueOnce([
			[
				"123",
				{
					id: "123",
					name: "Layer 1",
					image: new Blob(),
					position: 0
				}
			]
		]);

		// Verify that the layer is being added to the canvas

		const layer = screen.getByTestId("canvas-layer");
		expect(layer).toBeInTheDocument();
		expect(layer).toHaveAttribute("id", "123");
		expect(layer).toHaveAttribute("data-name", "Layer 1");
	});

	it("should set the layers in IndexedDB when saving", async () => {
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
			const [call1, call2] = indexedSetMock.mock.calls;

			expect(call1).toEqual([
				"layers",
				layer.id,
				{
					id: layer.id,
					name: layer.name,
					image: expect.any(Blob),
					position: 0
				}
			]);

			expect(call2).toEqual([
				"elements",
				"items",
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

	it("should open the reference window from the View menu", () => {
		const viewTab = screen.getByText("View");
		fireEvent.click(viewTab);

		const referenceWindowOption = screen.getByText("Reference Window");
		fireEvent.click(referenceWindowOption);

		const referenceWindow = screen.getByTestId("reference-window");
		expect(referenceWindow).toBeInTheDocument();
	});

	it("should close the reference window from the close button", () => {
		const viewTab = screen.getByText("View");
		fireEvent.click(viewTab);

		const referenceWindowOption = screen.getByText("Reference Window");
		fireEvent.click(referenceWindowOption);

		let referenceWindow = screen.queryByTestId("reference-window");
		expect(referenceWindow).toBeInTheDocument();

		expect(referenceWindowOption).not.toBeInTheDocument();

		// Close it.
		const closeRefWindow = screen.getByTestId("close-ref-window");
		fireEvent.click(closeRefWindow);

		referenceWindow = screen.queryByTestId("reference-window");

		expect(referenceWindow).not.toBeInTheDocument();
	});
});
