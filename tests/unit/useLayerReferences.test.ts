import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
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

	it("should return the inital values", () => {
		expect(result.result.current).toEqual({
			references: { current: [] },
			add: expect.any(Function),
			remove: expect.any(Function)
		});
	});

	it("should add a layer to the layers ref", () => {
		const dummyCanvas1 = document.createElement("canvas");
		const dummyCanvas2 = document.createElement("canvas");

		expect(result.result.current.references.current).toHaveLength(0);

		result.result.current.add(dummyCanvas1);

		expect(result.result.current.references.current).toHaveLength(1);

		result.result.current.add(dummyCanvas2, 1);

		expect(result.result.current.references.current).toHaveLength(2);
	});

	it("should remove a layer from the layers ref", () => {
		const dummyCanvas1 = document.createElement("canvas");
		const dummyCanvas2 = document.createElement("canvas");

		result.result.current.add(dummyCanvas1);
		result.result.current.add(dummyCanvas2);

		expect(result.result.current.references.current).toHaveLength(2);

		const removed1 = result.result.current.remove(0);

		expect(result.result.current.references.current).toHaveLength(1);
		expect(removed1).toEqual(dummyCanvas1);

		const removed2 = result.result.current.remove(0);

		expect(result.result.current.references.current).toHaveLength(0);
		expect(removed2).toEqual(dummyCanvas2);
	});

	describe("useLayerReferences error cases", () => {
		it("should throw if removing an out of bounce index", () => {
			const dummyCanvas = document.createElement("canvas");
			result.result.current.add(dummyCanvas);

			expect(() => result.result.current.remove(1)).toThrow(
				"Index out of bounds."
			);
			expect(() => result.result.current.remove(-1)).toThrow(
				"Index out of bounds."
			);
		});

		it("should throw if the hook is not inside the provider", () => {
			expect(() => renderHook(useLayerReferences)).toThrow(
				"useLayerReferences must be used within a LayerReferencesProvider"
			);
		});
	});
});
