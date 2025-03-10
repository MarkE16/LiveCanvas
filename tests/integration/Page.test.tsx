import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test-utils";

import { Page } from "../../pages/index/index.page";
import { SliceStores } from "../../types";

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

	it("should render the page", () => {
		renderWithProviders(<Page />, { preloadedState: mockState });

		expect(screen.getByTestId("nav-bar")).toBeInTheDocument();
		expect(screen.getByTestId("main-content")).toBeInTheDocument();
	});
});
