import {
	expect,
	describe,
	it,
	vi,
	beforeEach,
	afterEach,
	afterAll,
	MockInstance
} from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "../../components/Navbar/Navbar";
import { renderWithProviders } from "../test-utils";
import * as useLayerReferences from "../../state/hooks/useLayerReferences";

vi.mock("../../renderer/usePageContext", () => ({
	usePageContext: () => ({ urlPathname: "/" }) // Mock the hook
}));

describe("Navbar functionality", () => {
	let originalCreateObjectURL: typeof URL.createObjectURL;
	let originalRevokeObjectURL: typeof URL.revokeObjectURL;
	let originalRequestFullscreen: typeof HTMLElement.prototype.requestFullscreen;
	let originalExitFullscreen: typeof document.exitFullscreen;
	let useLayerReferencesSpy: MockInstance;
	const fullscreenElementMock = vi.fn().mockReturnValue(null);
	const canvas = document.createElement("canvas");
	canvas.setAttribute("data-dpi", "1");

	beforeEach(() => {
		useLayerReferencesSpy = vi
			.spyOn(useLayerReferences, "default")
			.mockReturnValue({
				references: {
					current: [canvas]
				},
				add: vi.fn(),
				remove: vi.fn(),
				setActiveIndex: vi.fn(),
				getActiveLayer: vi.fn()
			});
		renderWithProviders(<Navbar />);

		Object.defineProperty(document, "fullscreenElement", {
			get: fullscreenElementMock,
			configurable: true
		});

		originalRequestFullscreen = HTMLElement.prototype.requestFullscreen;
		HTMLElement.prototype.requestFullscreen = vi.fn();
		document.exitFullscreen = vi.fn();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	afterAll(() => {
		HTMLElement.prototype.requestFullscreen = originalRequestFullscreen;
		document.exitFullscreen = originalExitFullscreen;
		vi.restoreAllMocks();
	});

	it("should render the Navbar component", () => {
		const TABS = ["File", "Edit", "View", "Filter", "Admin"];
		const exportLink = screen.getByTestId("export-link");

		for (const tab of TABS) {
			expect(screen.getByText(tab)).not.toBeNull();
		}

		expect(exportLink).toBeInTheDocument();
		expect(exportLink).not.toBeVisible();
	});

	it("should open a dropdown for the File option", async () => {
		const fileTab = screen.getByRole("menuitem", { name: "File" });

		await userEvent.click(fileTab);

		const dropdown = screen.getByRole("menu");

		expect(dropdown).toBeInTheDocument();
		expect(dropdown).toBeVisible();

		const options = screen.getAllByRole("menuitem", {
			name: /Save File|Export File/i
		});

		expect(options).toHaveLength(2);
		expect(options[0]).toHaveTextContent("Save File");
		expect(options[1]).toHaveTextContent("Export File");
	});

	it("clicking on any tab other than File should open MUI 'not implemented' snackbar", async () => {
		const TABS = ["Edit", "View", "Filter", "Admin"];

		for (const tab of TABS) {
			fireEvent.click(screen.getByText(tab));

			// Wait for the snackbar to appear
			const snackbar = await screen.findByText(
				/This feature is not yet implemented/i
			);
			expect(snackbar).not.toBeNull();

			// Close the snackbar
			fireEvent.click(snackbar);
		}
	});

	it("should save the file when clicking Save File from File menu", async () => {
		const alertSpy = vi.spyOn(window, "alert");
		const fileTab = screen.getByRole("menuitem", { name: "File" });

		await userEvent.click(fileTab);

		const saveFileOption = screen.getByText("Save File");

		await userEvent.click(saveFileOption);

		await vi.waitFor(() => {
			expect(alertSpy).toHaveBeenCalledWith("Saved!");
		});
	});

	it("should show an error if failed to save", async () => {
		useLayerReferencesSpy.mockReturnValue({
			references: {
				current: []
			},
			add: vi.fn(),
			remove: vi.fn(),
			setActiveIndex: vi.fn(),
			getActiveLayer: vi.fn()
		});

		const alertSpy = vi.spyOn(window, "alert");
		const error = new Error(
			"Cannot export canvas: no references found. This is a bug."
		);

		const fileTab = screen.getByRole("menuitem", { name: "File" });

		await userEvent.click(fileTab);

		const saveFileOption = screen.getByText("Save File");

		await userEvent.click(saveFileOption);

		await vi.waitFor(() => {
			expect(alertSpy).toHaveBeenCalledWith(
				"Error saving file. Reason: " + error.message
			);
		});
	});

	it("should perform a save when using CTRL S", async () => {
		const alertSpy = vi.spyOn(window, "alert");
		fireEvent.keyDown(document, { key: "s", ctrlKey: true });

		await vi.waitFor(() => {
			expect(alertSpy).toHaveBeenCalledWith("Saved!");
		});
	});

	it("should export file when clicking Export File from File menu", async () => {
		const exportLink = screen.getByTestId("export-link");
		const clickSpy = vi.spyOn(exportLink, "click");
		const fileTab = screen.getByRole("menuitem", { name: "File" });

		await userEvent.click(fileTab);

		const exportFileOption = screen.getByText("Export File");

		await userEvent.click(exportFileOption);

		await vi.waitFor(() => {
			expect(clickSpy).toHaveBeenCalled();
		});
	});

	it("should toggle full screen from the View menu", async () => {
		const requestFullscreenSpy = vi.spyOn(
			HTMLElement.prototype,
			"requestFullscreen"
		);
		const exitFullscreenSpy = vi.spyOn(document, "exitFullscreen");
		const viewTab = screen.getByRole("menuitem", { name: "View" });

		await userEvent.click(viewTab);

		let fullScreenOption = screen.getByText("Toggle Full Screen");

		await userEvent.click(fullScreenOption);

		// Toggle it.
		expect(requestFullscreenSpy).toHaveBeenCalled();

		// Toggle it back.
		// Note: We need to pretend that the document is in full screen mode.
		// So, we need to mock the getter of `document.fullscreenElement`.
		Object.defineProperty(document, "fullscreenElement", {
			get: fullscreenElementMock.mockReturnValue(true),
			configurable: true
		});

		await userEvent.click(viewTab);

		fullScreenOption = screen.getByText("Toggle Full Screen");
		await userEvent.click(fullScreenOption);

		expect(exitFullscreenSpy).toHaveBeenCalled();
	});
});
