// Lib
import { expect, it, describe, beforeEach, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import { MODES } from "../state/store";
import * as UTILS from "../utils";

// Components
import LeftToolbar from "../components/LeftToolbar/LeftToolbar";

vi.mock("../../renderer/usePageContext", () => ({
	usePageContext: () => ({ urlPathname: "/" }) // Mock the hook
}));

describe("Left Toolbar functionality", () => {
	beforeEach(() => {
		renderWithProviders(<LeftToolbar />);
	});

	it("should render the component", async () => {
		const container = screen.getByTestId("left-toolbar-container");

		expect(container.children).toHaveLength(MODES.length);

		for (const mode of MODES) {
			const button = screen.getByTestId(mode.name);

			expect(button).not.toBeNull();
		}
	});

	it("should properly show tooltips on hover", async () => {
		for (const mode of MODES) {
			const button = screen.getByTestId(mode.name);
			const modeNameCapitalized = UTILS.capitalize(mode.name, {
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
		const firstMode = screen.getByTestId(MODES[0].name);

		// First mode should be active by default
		expect(firstMode).not.toBeNull();
		expect(firstMode.classList.contains("active")).toBe(true);

		// Click on all the other modes
		for (let i = 1; i < MODES.length; i++) {
			const mode = screen.getByTestId(MODES[i].name);
			const previousMode = screen.getByTestId(MODES[i - 1].name);

			expect(mode).not.toBeNull();
			expect(previousMode).not.toBeNull();

			expect(mode.classList.contains("active")).toBe(false);
			expect(previousMode.classList.contains("active")).toBe(true);

			fireEvent.click(mode);

			expect(mode.classList.contains("active")).toBe(true);
			expect(previousMode.classList.contains("active")).toBe(false);
		}
	});
});
