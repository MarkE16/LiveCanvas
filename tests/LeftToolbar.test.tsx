// Lib
import { expect, it, describe, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import { MODES } from "../state/store";

// Components
import LeftToolbar from "../components/LeftToolbar/LeftToolbar";

vi.mock("../../renderer/usePageContext", () => ({
	usePageContext: () => ({ urlPathname: "/" }) // Mock the hook
}));

describe("Left Toolbar functionality", () => {
	beforeEach(() => {
		renderWithProviders(<LeftToolbar />);
	});

	it("should render the component", () => {
		const container = screen.getByTestId("modes");

		expect(container.childNodes).toHaveLength(MODES.length);

		container.childNodes.forEach((element, i) => {
			const btn = element.childNodes[0];

			if (i === 0) {
				// First button should be active by default
				expect(btn).toHaveProperty("className", "toolbar-option active");
			} else {
				expect(btn).toHaveProperty("className", "toolbar-option");
			}

			expect(btn).toHaveProperty("data-modeName", MODES[i].name);
			expect(btn).toHaveProperty("data-iconName", MODES[i].icon);
			expect(btn).toHaveProperty("data-shortcut", MODES[i].shortcut);
		});
	});
});
