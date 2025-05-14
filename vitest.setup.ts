import { eventSetup, mockURLInterface } from "@/tests/test-utils";
import "@testing-library/jest-dom"; // to import additional matchers
import { vi } from "vitest";

vi.mock("./src/renderer/usePageContext", () => ({
	usePageContext: () => ({ urlPathname: "/" }) // Mock the hook
}));


eventSetup();
mockURLInterface();