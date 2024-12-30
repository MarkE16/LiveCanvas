import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { RenderHookResult } from "@testing-library/react";
import { renderHookWithProviders } from "../test-utils";
import useLayerReferences from "../../state/hooks/useLayerReferences";

describe("useLayerReferences functionality", () => {
	let result: RenderHookResult<ReturnType<typeof useLayerReferences>, unknown>;

	beforeEach(() => {
		result = renderHookWithProviders(useLayerReferences);
	});

	afterEach(() => {
		result.unmount();
	});

	it("should initally return an empty array", () => {
		expect(result.result.current).toEqual([]);
	});
});
