import {
	describe,
	it,
	expect,
	vi,
	afterEach,
	afterAll,
	beforeAll
} from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithProviders } from "../test-utils";
import * as Utils from "../../lib/utils";

import { Page } from "../../pages/editor/index.page";
import { SliceStores } from "../../types";

describe("Page", () => {
	const generateImageSpy = vi
		.spyOn(Utils, "generateCanvasImage")
		.mockResolvedValue(new Blob());
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

	beforeAll(() => {
		originalCreateObjectURL = URL.createObjectURL;
		originalRevokeObjectURL = URL.revokeObjectURL;
		URL.createObjectURL = vi.fn().mockReturnValue("blob://localhost:3000/1234");
		URL.revokeObjectURL = vi.fn();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	afterAll(() => {
		URL.createObjectURL = originalCreateObjectURL;
		URL.revokeObjectURL = originalRevokeObjectURL;
		vi.restoreAllMocks();
	});

	it("should render the page", () => {
		renderWithProviders(<Page />, { preloadedState: mockState });

		expect(screen.getByTestId("nav-bar")).toBeInTheDocument();
		expect(screen.getByTestId("main-content")).toBeInTheDocument();
	});

	describe("Exporting Canvas functionality", () => {
		it("should export an image with no elements", async () => {
			renderWithProviders(<Page />, { preloadedState: mockState });

			const createObjectURLSpy = vi.spyOn(URL, "createObjectURL");
			const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL");
			const exportButton = screen.getByTestId("export-button");
			const exportLink = screen.getByTestId("export-link") as HTMLAnchorElement;
			const exportLinkClickSpy = vi.spyOn(exportLink, "click");

			const canvases = mockState.layers!.map((layer) => {
				const canvas = document.createElement("canvas");
				canvas.width = 400;
				canvas.height = 400;
				canvas.id = layer.id;
				canvas.className = "canvas " + (layer.active ? "active" : "");
				canvas.setAttribute("data-name", layer.name);
				canvas.setAttribute("data-dpi", "1");
				canvas.setAttribute("data-scale", "1");
				canvas.setAttribute("data-testid", "canvas-layer");
				canvas.style.width = "400px";
				canvas.style.height = "400px";
				canvas.style.transform = "translate(0px, 0px) scale(1)";

				return canvas;
			});

			await act(async () => {
				fireEvent.click(exportButton);
			});

			expect(generateImageSpy).toHaveBeenCalledWith(
				canvases,
				// Not really a straightforward way to expect an ArrayLike object.
				// This is the way I found that works.
				expect.objectContaining({
					length: 0
				}),
				1,
				true
			);
			expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob));
			expect(exportLink).toHaveAttribute("href", "blob://localhost:3000/1234");
			expect(exportLink).toHaveAttribute("download", "canvas.png");
			expect(exportLinkClickSpy).toHaveBeenCalled();
			expect(revokeObjectURLSpy).toHaveBeenCalledWith(
				"blob://localhost:3000/1234"
			);
		});

		it("should export an image with elements", async () => {
			renderWithProviders(<Page />, {
				preloadedState: {
					...mockState,
					elements: [
						{
							id: "123",
							type: "rectangle",
							x: 0,
							y: 0,
							width: 100,
							height: 100,
							fill: "#000",
							stroke: "#000",
							layerId: "123",
							focused: false
						}
					]
				}
			});

			const createObjectURLSpy = vi.spyOn(URL, "createObjectURL");
			const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL");
			const exportButton = screen.getByTestId("export-button");
			const exportLink = screen.getByTestId("export-link") as HTMLAnchorElement;
			const exportLinkClickSpy = vi.spyOn(exportLink, "click");

			const canvases = mockState.layers!.map((layer) => {
				const canvas = document.createElement("canvas");
				canvas.width = 400;
				canvas.height = 400;
				canvas.id = layer.id;
				canvas.className = "canvas " + (layer.active ? "active" : "");
				canvas.setAttribute("data-name", layer.name);
				canvas.setAttribute("data-dpi", "1");
				canvas.setAttribute("data-scale", "1");
				canvas.setAttribute("data-testid", "canvas-layer");
				canvas.style.width = "400px";
				canvas.style.height = "400px";
				canvas.style.transform = "translate(0px, 0px) scale(1)";

				return canvas;
			});

			await act(async () => {
				fireEvent.click(exportButton);
			});

			expect(generateImageSpy).toHaveBeenCalledWith(
				canvases,
				expect.objectContaining({
					0: expect.any(SVGElement),
					length: 1
				}),
				1,
				true
			);
			expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob));
			expect(exportLink).toHaveAttribute("href", "blob://localhost:3000/1234");
			expect(exportLink).toHaveAttribute("download", "canvas.png");
			expect(exportLinkClickSpy).toHaveBeenCalled();
			expect(revokeObjectURLSpy).toHaveBeenCalledWith(
				"blob://localhost:3000/1234"
			);
		});
	});
});
