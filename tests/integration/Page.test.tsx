import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test-utils";

import { Page } from "../../pages/index/index.page";

describe("Page", () => {
	beforeEach(() => {
		renderWithProviders(<Page />);
	});

	it("should render the page", () => {
		expect(screen.getByTestId("nav-bar")).toBeInTheDocument();
		expect(screen.getByTestId("main-content")).toBeInTheDocument();
	});
});
