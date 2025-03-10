// Lib
import { expect, it, describe, beforeEach, afterEach, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "../test-utils";
import { MODES } from "../../state/store";
import * as Utils from "../../lib/utils";

// Components
import LeftToolbar from "../../components/LeftToolbar/LeftToolbar";

vi.mock("../../renderer/usePageContext", () => ({
	usePageContext: () => ({ urlPathname: "/" }) // Mock the hook
}));

describe("Left Toolbar functionality", () => {
	beforeEach(() => {
		renderWithProviders(<LeftToolbar />);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	it("should render the component", async () => {
		const container = screen.getByTestId("left-toolbar-container");

		expect(container.children).toHaveLength(MODES.length);

		for (const mode of MODES) {
			const button = screen.getByTestId(`tool-${mode.name}`);

			expect(button).toBeInTheDocument();
		}
	});

	it("should properly show tooltips on hover", async () => {
		for (const mode of MODES) {
			const button = screen.getByTestId(`tool-${mode.name}`);
			const modeNameCapitalized = Utils.capitalize(mode.name, {
				titleCase: true,
				delimiter: "_"
			}).replace("_", " ");
			const expectedTooltipText =
				modeNameCapitalized + ` (${mode.shortcut.toUpperCase()})`;

			fireEvent.mouseOver(button); // Hover over the button to show the tooltip

			const tooltip = await screen.findByText(
				new RegExp(modeNameCapitalized, "i")
			);
			expect(tooltip).not.toBeNull();
			expect(tooltip.textContent).toBe(expectedTooltipText);
		}
	});

	it("should properly change to all existing modes", () => {
		const firstMode = screen.getByTestId(`tool-${MODES[0].name}`);

		// First mode should be active by default
		expect(firstMode).not.toBeNull();
		expect(firstMode.classList.contains("active")).toBe(true);

		// Click on all the other modes
		for (let i = 1; i < MODES.length; i++) {
			const mode = screen.getByTestId(`tool-${MODES[i].name}`);
			const previousMode = screen.getByTestId(`tool-${MODES[i - 1].name}`);

			expect(mode).not.toBeNull();
			expect(previousMode).not.toBeNull();

			if (MODES[i].name === "undo" || MODES[i].name === "redo") {
				// These aren't necessarily modes that we can change to; they're just actions. So, we skip them.
				break;
			}
			expect(mode.classList).not.toContain("active");
			expect(previousMode.classList).toContain("active");

			fireEvent.click(mode);

			expect(mode.classList).toContain("active");
			expect(previousMode.classList).not.toContain("active");
		}
	});
});
