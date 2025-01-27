import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../test-utils";
import {
	describe,
	it,
	expect,
	beforeEach,
	vi,
	afterEach,
	afterAll
} from "vitest";
import SaveCanvasButton from "../../components/SaveCanvasButton/SaveCanvasButton";
import * as useLayerReferences from "../../state/hooks/useLayerReferences";
import { SliceStores } from "../../types";

describe("SaveCanvasButton functionality", () => {
	let toBlobSpies: ReturnType<typeof vi.spyOn>[];

	beforeEach(() => {
		const mockCanvas1 = document.createElement("canvas");
		const mockCanvas2 = document.createElement("canvas");
		const mockCanvas3 = document.createElement("canvas");
		mockCanvas1.id = "123";
		mockCanvas1.setAttribute("data-name", "test canvas 1");
		mockCanvas2.id = "456";
		mockCanvas2.setAttribute("data-name", "test canvas 2");
		mockCanvas3.id = "789";
		mockCanvas3.setAttribute("data-name", "test canvas 3");

		const array = [mockCanvas1, mockCanvas2, mockCanvas3];

		toBlobSpies = array.map((canvas) => {
			const toBlobSpy = vi.spyOn(canvas, "toBlob").mockImplementation((cb) => {
				cb(new Blob());
			});

			return toBlobSpy;
		});

		const mockState: Partial<SliceStores> = {
			elements: [
				{
					id: "123",
					x: 0,
					y: 0,
					width: 100,
					height: 100,
					layerId: "456",
					focused: false,
					type: "rectangle",
					fill: "#ff0000",
					stroke: "#000000"
				}
			]
		};

		vi.spyOn(useLayerReferences, "default").mockReturnValue({
			references: { current: array },
			add: vi.fn(),
			remove: vi.fn(),
			setActiveIndex: vi.fn(),
			getActiveLayer: vi.fn()
		});
		
		renderWithProviders(<SaveCanvasButton />, { preloadedState: mockState });
	});

	afterEach(() => {
		toBlobSpies.forEach((spy) => spy.mockRestore());
	});

	afterAll(() => {
		vi.restoreAllMocks();
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

		let tooltip = await screen.findByText(/save canvas/i);

		expect(tooltip).not.toBeNull();
		expect(tooltip).toHaveTextContent("Save Canvas (CTRL + S)");

		fireEvent.click(saveCanvasButton);

		toBlobSpies.forEach((spy) => {
			expect(spy).toHaveBeenCalled();
		});

		// Wait for the tooltip to change
		tooltip = await screen.findByText(/saved!/i);

		expect(tooltip).not.toBeNull();
		expect(tooltip).toHaveTextContent("Saved!");

		// Wait for the tooltip to change back
		tooltip = await screen.findByText(/save canvas/i);
		expect(tooltip).not.toBeNull();
		expect(tooltip).toHaveTextContent("Save Canvas (CTRL + S)");
	});

	it("should indicate that the canvas was saved on the tooltip after keyboard shortcut", async () => {
		const saveCanvasButton = screen.getByRole("button");

		expect(saveCanvasButton).not.toBeNull();
		fireEvent.mouseOver(saveCanvasButton);

		let tooltip = await screen.findByText(/save canvas/i);
		expect(tooltip).not.toBeNull();
		expect(tooltip.textContent).toBe("Save Canvas (CTRL + S)");

		fireEvent.keyDown(window, { key: "s", ctrlKey: true });

		toBlobSpies.forEach((spy) => {
			expect(spy).toHaveBeenCalled();
		});

		// Wait for the tooltip to change
		tooltip = await screen.findByText(/saved!/i);
		expect(tooltip).not.toBeNull();
		expect(tooltip.textContent).toBe("Saved!");
	});
});
