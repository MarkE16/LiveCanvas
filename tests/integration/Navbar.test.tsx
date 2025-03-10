import {
	expect,
	describe,
	it,
	vi,
	beforeEach,
	afterEach,
	afterAll
} from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import Navbar from "../../components/Navbar/Navbar";
import { renderWithProviders } from "../test-utils";
import { SliceStores } from "../../types";
import * as useLayerReferences from "../../state/hooks/useLayerReferences";

vi.mock("../../renderer/usePageContext", () => ({
	usePageContext: () => ({ urlPathname: "/" }) // Mock the hook
}));

describe("Navbar functionality", () => {
	const mockState: Partial<SliceStores> = {
		prepareForSave: vi.fn().mockResolvedValue({
			layers: [],
			elments: []
		}),
		prepareForExport: vi.fn().mockResolvedValue(new Blob())
	};
	let originalCreateObjectURL: typeof URL.createObjectURL;
	let originalRevokeObjectURL: typeof URL.revokeObjectURL;

	beforeEach(() => {
		renderWithProviders(<Navbar />, { preloadedState: mockState });

		originalCreateObjectURL = URL.createObjectURL;
		originalRevokeObjectURL = URL.revokeObjectURL;
		URL.createObjectURL = vi.fn().mockReturnValue("blob://localhost:3000/1234");
		URL.revokeObjectURL = vi.fn();

		const canvas = document.createElement("canvas");

		vi.spyOn(useLayerReferences, "default").mockReturnValue({
			references: {
				current: [canvas]
			},
			add: vi.fn(),
			remove: vi.fn(),
			setActiveIndex: vi.fn(),
			getActiveLayer: vi.fn()
		});
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	afterAll(() => {
		URL.createObjectURL = originalCreateObjectURL;
		URL.revokeObjectURL = originalRevokeObjectURL;
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

	it("should open a dropdown for the File option", () => {
		const fileTab = screen.getByText("File");

		fireEvent.click(fileTab);

		const dropdown = screen.getByRole("menu");

		expect(dropdown).toBeInTheDocument();
		expect(dropdown).toBeVisible();

		const options = screen.getAllByRole("menuitem");

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

	it("should call prepareForSave when clicking Save File from File dropdown", () => {
		const fileTab = screen.getByText("File");

		fireEvent.click(fileTab);

		const saveFileOption = screen.getByText("Save File");

		fireEvent.click(saveFileOption);

		expect(mockState.prepareForSave).toHaveBeenCalledWith(
			expect.any(Array<HTMLCanvasElement>)
		);
	});

	it("should call prepareForExport when clicking Export File from File dropdown", () => {
		const fileTab = screen.getByText("File");

		fireEvent.click(fileTab);

		const exportFileOption = screen.getByText("Export File");

		fireEvent.click(exportFileOption);

		expect(mockState.prepareForExport).toHaveBeenCalledWith(
			expect.any(Array<HTMLCanvasElement>)
		);
	});
});
