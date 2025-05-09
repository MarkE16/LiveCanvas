import "@testing-library/jest-dom"; // to import additional matchers
import { vi } from "vitest";

vi.mock("../../renderer/usePageContext", () => ({
	usePageContext: () => ({ urlPathname: "/" }) // Mock the hook
}));
