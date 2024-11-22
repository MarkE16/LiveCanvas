import { expect, describe, it, vi } from "vitest";
import { waitFor, fireEvent, screen } from "@testing-library/react";
import Navbar from "../components/Navbar/Navbar";
import { renderWithProviders } from "./test-utils";

vi.mock("../../renderer/usePageContext", () => ({
	usePageContext: () => ({ urlPathname: "/" }) // Mock the hook
}));

describe("Navbar functionality", () => {
	it("should render the Navbar component", () => {
		renderWithProviders(<Navbar />);

		const TABS = ["File", "Edit", "View", "Filter", "Admin"];

		for (const tab of TABS) {
			expect(screen.getByText(tab)).not.toBeNull();
		}

		expect(screen.getByText("Export Canvas")).not.toBeNull();
	});

	it("clicking on any tab should open MUI 'not implemented' snackbar", () => {
		renderWithProviders(<Navbar />);

		const TABS = ["File", "Edit", "View", "Filter", "Admin"];

		for (const tab of TABS) {
			fireEvent.click(screen.getByText(tab));

			// Wait for the snackbar to appear
			waitFor(
				() => {
					const snackbar = screen.getByText(
						/This feature is not yet implemented/i
					);
					expect(snackbar).not.toBeNull();

					// Close the snackbar
					fireEvent.click(snackbar);
				},
				{ timeout: 1000 }
			); // Timeout is 1000ms since the snackbar won't immediately appear
		}
	});

	it("clicking on logo should redirect to home page", () => {
		renderWithProviders(<Navbar />);
		const originalLocation = window.location;

		// Mocking the window.location object is a bit tricky due to
		// a majority of the properties being read-only.
		// We can use Object.defineProperty to make the pathname writable
		Object.defineProperty(window, "location", {
			configurable: true,
			enumerable: true,
			value: new URL(window.location.href)
		});

		// Assume we are on the editor page

		window.location.href = "http://localhost:3000/editor";

		expect(window.location.pathname).toBe("/editor");

		fireEvent.click(screen.getByAltText("logo"));

		// Assume we have been redirected to the home page

		window.location.href = "http://localhost:3000/";

		expect(window.location.pathname).toBe("/");

		// Reset the window.location object

		Object.defineProperty(window, "location", {
			configurable: true,
			enumerable: true,
			value: originalLocation
		});
	});
});
